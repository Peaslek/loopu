import { args } from "../../args";
import {
  beach,
  clipArt,
  endPtrack,
  getFishy,
  glitch,
  nightcap,
  pajamas,
  pull,
  sausage,
  scepterProfit,
  tofu,
} from "../common";
import { Leg, Quest, getCurrentLeg } from "../structure";
import {
  canDiet,
  doneAdventuring,
  getPerms,
  setRef,
  stooperDrunk,
  totallyDrunk,
} from "../utils";
import { step } from "grimoire-kolmafia";
import {
  Item,
  buy,
  cliExecute,
  create,
  daycount,
  equip,
  hippyStoneBroken,
  inebrietyLimit,
  itemAmount,
  myAdventures,
  myAscensions,
  myInebriety,
  myPath,
  mySign,
  numericModifier,
  print,
  use,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $familiars,
  $item,
  $items,
  $path,
  Lifestyle,
  ascend,
  get,
  have,
  set,
  uneffect,
} from "libram";

// Everything we should pull for CS
const pullItems: Item[] = $items`Buddy Bjorn, Staff of the Roaring Hearth , Great Wolf's beastly trousers`;
// const pullItems = $items`Staff of the Roaring Hearth, Great Wolf's beastly trousers`;

// Should we make anything?
const crafts: Item[] = $items`Calzone of Legend, Pizza of Legend`;
// Should we buy any consumables?
const buyItems: Item[] = [];

const allPulls = pullItems.concat(crafts);

export function prepCS(): Quest {
  return {
    name: "CS",
    completed: () =>
      getCurrentLeg() === Leg.CommunityService || get("ascensionsToday") === 1,
    tasks: [
      {
        name: "Get Items",
        completed: () => {
          return (
            allPulls.filter((item) => have(item)).length === allPulls.length ||
            myPath() === $path`Community Service`
          );
        },
        do: (): void => {
          for (const item of buyItems) {
            if (!have(item)) {
              buy(item);
            }
          }
          for (const item of crafts) {
            if (!have(item)) {
              create(item);
            }
          }
        },
        tracking: "prep",
      },
      {
        name: "Visit Council",
        completed: () => get("_loopuCouncilVisited", true),
        do: (): void => {
          visitUrl("council.php");
          set("_loopuCouncilVisited", true);
        },
      },
      {
        name: "Ascend CS",
        completed: () =>
          getCurrentLeg() >= Leg.CommunityService && daycount() === 0,
        ready: () => allPulls.filter((item) => have(item)).length >= 5,
        do: (): void => {
          const perms = getPerms();
          ascend(
            $path`Community Service`,
            $class`Sauceror`,
            Lifestyle.softcore,
            "blender",
            $item`astral six-pack`,
            $item`astral chapeau`,
            // $item`astral pet sweater`,
            { permSkills: perms, neverAbort: false },
          );
          cliExecute("refresh all");
        },
      },
    ],
  };
}

export function csRun(): Quest {
  return {
    name: "CS",
    completed: () =>
      getCurrentLeg() !== Leg.CommunityService ||
      (step("questL13Final") > 11 && get("ascensionsToday") === 1),
    tasks: [
      {
        name: "Refresh All",
        completed: () => get("_loopuRefreshed", false),
        do: () => {
          cliExecute("refresh all");
          set("_loopuRefreshed", true);
        },
      },
      {
        name: "Prep Fireworks Shop",
        completed: () =>
          !have($item`Clan VIP Lounge key`) ||
          get("_loopuFireworksPrepped", false),
        do: () => {
          visitUrl("clan_viplounge.php?action=fwshop&whichfloor=2");
          set("_loopuFireworksPrepped", true);
        },
      },
      {
        name: "SIT Course",
        ready: () => have($item`S.I.T. Course Completion Certificate`),
        completed: () => get("_sitCourseCompleted", false),
        choices: {
          1494: 2,
        },
        do: () => use($item`S.I.T. Course Completion Certificate`),
      },

      {
        name: "Stillsuit Prep",
        completed: () => itemAmount($item`tiny stillsuit`) === 0,
        do: () =>
          equip(
            $item`tiny stillsuit`,
            get(
              "stillsuitFamiliar",
              $familiars`Gelatinous Cubeling`.find((fam) => have(fam)) ||
                $familiar`none`,
            ),
          ),
      },
      ...pull(pullItems),
      {
        name: "Run",
        completed: () => get("lastEmptiedStorage") === myAscensions(),
        do: () => {
          // Tested
          // Batteries?
          set("_instant_skipDeepDishOfLegend", true);
          set("instant_saveEuclideanAngle", true);
          set("instant_savePerfectFreeze", true);
          set("instant_saveRichRicotta", true);
          set("instant_saveRicottaCasserole", true);
          set("instant_saveRoastedVegetableItem", true);
          set("instant_saveRoastedVegetableStats", true);
          set("instant_saveSacramentoWine", true);
          set("instant_saveWileyWheyBar", true);
          set("instant_saveBackups", 1);
          set("instant_saveAugustScepter", true);
          set("instant_skipCyclopsEyedrops", true);
          set("instant_skipGovernment", true);
          set("instant_skipEarlyTrainsetMeat", true);

          // CBB legends
          set("_instant_skipPizzaOfLegend", false);
          set("_instant_skipDeepDishOfLegend", true);
          set("_instant_skipCalzoneOfLegend", false);

          // Adds turns, saves organs
          set("instant_saveSockdollager", true);

          // Adds 2 turns?
          set("instant_skipAutomaticOptimizations", true);

          // Need to evaluate turn increase
          set("instant_skipCabernetSauvignon", true);
          set("instant_skipSynthExp", true);

          // current test
          set("instant_skipDistilledFortifiedWine", true);

          cliExecute(args.csscript);
          setRef("CSDone", true);
        },
        clear: "all",
        tracking: "run",
      },
    ],
  };
}

export function postCS(): Quest {
  return {
    name: "CS",
    completed: () => getCurrentLeg() !== Leg.CommunityService && totallyDrunk(),
    tasks: [
      {
        name: "Moon Spoon",
        completed: () =>
          !have($item`hewn moon-rune spoon`) ||
          get("moonTuned") ||
          mySign().toLowerCase() === "wombat",
        do: () => cliExecute("spoon wombat"),
      },
      {
        name: "Breakfast",
        completed: () => get("breakfastCompleted"),
        do: () => cliExecute("breakfast"),
        tracking: "breakfast",
      },
      beach(),
      clipArt(true),
      tofu(),
      glitch(),
      getFishy(false),
      scepterProfit(true, 4), // Save for rollover
      {
        name: "Garbo",
        ready: () => myInebriety() <= inebrietyLimit() && myAdventures() > 0,
        completed: () => (myAdventures() === 0 && !canDiet()) || stooperDrunk(),
        prepare: () => uneffect($effect`Beaten Up`),
        do: () => {
          set("valueOfAdventure", args.voa);
          cliExecute(args.garbocs);
        },
        clear: "all",
        tracking: "garbo",
      },
      sausage(),
      {
        name: "Break Stone",
        completed: () => hippyStoneBroken(),
        do: (): void => {
          visitUrl("peevpee.php?action=smashstone&pwd&confirm=on", true);
          visitUrl("peevpee.php?place=fight");
        },
      },
      nightcap(),
      endPtrack(),
      pajamas(),
      {
        name: "Alert-No Nightcap",
        ready: () => !doneAdventuring(),
        completed: () => stooperDrunk(),
        do: (): void => {
          const targetAdvs = 100 - numericModifier("adventures");
          print("loopu completed, but did not overdrink.", "red");
          if (targetAdvs < myAdventures() && targetAdvs > 0) {
            print(
              `Rerun with fewer than ${targetAdvs} adventures for loopu to handle your diet`,
              "red",
            );
          } else {
            print("Something went wrong.", "red");
          }
        },
      },
    ],
  };
}

export function CSQuests(): Quest[] {
  return [prepCS(), csRun(), postCS()];
}
