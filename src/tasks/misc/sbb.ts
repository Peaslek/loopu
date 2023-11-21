import { Quest } from "../structure";
import { heal } from "../utils";
import { CombatStrategy } from "grimoire-kolmafia";
import {
  Monster,
  cliExecute,
  haveEffect,
  itemAmount,
  itemDropModifier,
  use,
  useFamiliar,
  useSkill,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  Macro,
  get,
  have,
} from "libram";

/*

Script to Farm 20 items daily from SBB

TODO:
	outfit code to add fam exp to modifier, instead of hard-coding
	dynamically choose best monster to farm out of the two
*/

const ITEM_TARGET = 700;
const RUN_AWAY_ITEM = $item`peppermint parasol`;
const RUN_AWAY_AMOUNT = 30;

function dinerCombat(toFarm: Monster, toSkip: Monster) {
  /*
    Farm items from the diner, skip the cocktail
  */
  const killSKill = $skill`Shrap`;
  const cocktail = $monster`Sloppy Seconds Cocktail`;
  return new Macro()
    .trySkill($skill`Sing Along`)
    .trySkill($skill`Bowl Straight Up`)
    .tryItem($item`porquoise-handled sixgun`)
    .trySkill($skill`Emit Matter Duplicating Drones`)
    .if_(toFarm, Macro.trySkill($skill`Transcendent Olfaction`))
    .if_(toSkip, Macro.item(RUN_AWAY_ITEM, RUN_AWAY_ITEM).repeat())
    .if_(cocktail, Macro.item(RUN_AWAY_ITEM, RUN_AWAY_ITEM).repeat())
    .skill(killSKill)
    .repeat();
}

export function Sloppy(): Quest {
  const toSkip = $monster`Sloppy Seconds Sundae`;
  const toFarm = $monster`Sloppy Seconds Burger`;

  return {
    name: "Farm Diner",
    completed: () => get("garbageChampagneCharge") === 1,
    tasks: [
      {
        name: "Prep",
        completed: () =>
          get("_garbageItemChanged") === true &&
          haveEffect($effect`Steamed Sinuses`) > 1,
        acquire: [
          {
            item: $item`pulled blue taffy`,
            price: 5000,
            optional: false,
            num: 1,
            useful: () => {
              return (
                itemAmount($item`pulled blue taffy`) === 0 &&
                haveEffect($effect`Blue Swayed`) === 0
              );
            },
          },
          {
            item: $item`ghost dog chow`,
            price: 3000,
            optional: true,
            num: 3,
            useful: () => {
              return $familiar`Grey Goose`.experience < 36;
            },
          },
          {
            item: RUN_AWAY_ITEM,
            price: 4000,
            optional: false,
            num: 1,
            useful: () => itemAmount(RUN_AWAY_ITEM) < RUN_AWAY_AMOUNT,
          },
          {
            item: $item`broken champagne bottle`,
          },
        ],
        do: () => {
          cliExecute("equip broken champagne bottle");
          cliExecute("use portable steam unit");
          cliExecute("maximize item");
          useSkill($skill`Curiosity of Br'er Tarrypin`, 2);
          useFamiliar($familiar`Grey Goose`);

          if (have($item`pulled blue taffy`)) {
            use($item`pulled blue taffy`);
          }

          let count = 0;
          while (
            $familiar`Grey Goose`.experience < 36 &&
            have($item`ghost dog chow`)
          ) {
            use($item`ghost dog chow`);
            count += 1;
            if (count > 3) {
              throw "Looped too many times using chow, something is up";
            }
          }
        },
        limit: { tries: 1 },
        tracking: "Prep",
      },
      {
        name: "Farm",
        after: ["Prep"],
        prepare: () => heal(0.5),
        ready: () => itemDropModifier() >= ITEM_TARGET,
        completed: () => get("garbageChampagneCharge") === 1,
        do: $location`Sloppy Seconds Diner`,
        choices: { 919: 1 },
        combat: new CombatStrategy().autoattack(dinerCombat(toFarm, toSkip)),
        outfit: {
          weapon: $item`yule hatchet`,
          familiar: $familiar`Grey Goose`,
          famequip: $item`grey down vest`,
          acc1: $item`teacher's pen`,
          acc2: $item`teacher's pen`,
          modifier: "item",
        },
        // Counts runaways aswell
        limit: { turns: 30 },
        tracking: "SBB",
      },
    ],
  };
}
