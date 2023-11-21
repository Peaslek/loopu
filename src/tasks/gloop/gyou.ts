import { CombatStrategy, Quest, Task, step } from "grimoire-kolmafia";
import {
  Familiar,
  Item,
  cliExecute,
  equip,
  equippedItem,
  familiarWeight,
  getWorkshed,
  itemAmount,
  myAdventures,
  myClass,
  myStorageMeat,
  myTurncount,
  runChoice,
  storageAmount,
  toInt,
  toItem,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $item,
  $location,
  $locations,
  $path,
  $skill,
  $slot,
  AutumnAton,
  Lifestyle,
  Macro,
  ascend,
  ensureEffect,
  get,
  getKramcoWandererChance,
  have,
} from "libram";
import { setSong } from "libram/dist/resources/2018/SongBoom";

import { acquire, cliExecuteThrow } from "../utils";
import { OrganQuest } from "./organ";

const pullItems = [
  $item`mafia thumb ring`,
  // $item`one-day ticket to Dinseylandfill`,
  // $item`lucky gold ring`,
  $item`Mr. Cheeng's spectacles`,
];
export const autumnAtonZones = $locations`The Toxic Teacups, The Oasis, The Deep Dark Jungle, The Bubblin' Caldera, The Sleazy Back Alley`;

function leveling() {
  /*
    Leveling combat script
    TODO: Add support for other classes
  */
  return (
    new Macro()
      .trySkill($skill`Curse of Weaksauce`)
      .tryItem($item`porquoise-handled sixgun`)
      .externalIf(
        familiarWeight($familiar`Grey Goose`) === 20,
        Macro.skill($skill`Convert Matter to Protein`),
      )
      // .ifNot($monster`God Lobster`, Macro.tryItem($item`El Vibrato restraints`))
      .if_(
        $location`The Neverending Party`,
        Macro.trySkill($skill`Bowl Sideways`),
      )
      .if_(
        $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`,
        Macro.trySkill($skill`Gingerbread Mob Hit`).trySkill(
          $skill`Shattering Punch`,
        ),
      )
      .trySkill($skill`Pocket Crumbs`)
      .attack()
      .repeat()
  );
}

function gyouBarf() {
  /*
  Combat while in goo form
  Stop using bowl straight up so we have it for teacups
 */
  let mac = new Macro().trySkill($skill`Sing Along`);

  if (myAdventures() >= 100) {
    mac = mac.trySkill($skill`Bowl Straight Up`);
  }

  mac = mac.trySkill($skill`Double Nanovision`).attack().repeat();

  return mac;
}

// When we farm barf in goop
function barfFarmSetup() {
  if (
    equippedItem($slot`off-hand`) !== $item`Half a Purse` &&
    itemAmount($item`Half a Purse`) < 1
  ) {
    cliExecute("skill summon smith");
    cliExecute("skill summon smith");
    cliExecute("skill summon smith");
    cliExecute("make Half a purse");
  }
  if (have($item`Flaskfull of Hollow`)) {
    ensureEffect($effect`Merry Smithsness`);
  }
  if (have($item`How to Avoid Scams`)) {
    ensureEffect($effect`How to Scam Tourists`);
  }
  if (
    itemAmount($item`carpe`) === 0 &&
    equippedItem($slot`back`) !== $item`carpe`
  ) {
    cliExecute("Acquire Carpe");
  }

  setSong("Total Eclipse of Your Meat");
}

// Familiar leveling while in ronin still
const familiarTargets: Map<Familiar, number> = new Map([
  [$familiar`Urchin Urchin`, 20],
  [$familiar`Pocket Professor`, 20],
]);

function getLevelingFamiliar(): Familiar {
  for (const [key, value] of familiarTargets) {
    if (familiarWeight(key) < value) {
      return key;
    }
  }
  return $familiar`Hobo Monkey`;
}

function pull(items: Item[]): Task[] {
  return items.map((i) => {
    const task: Task = {
      name: "Pull shit",
      completed: () =>
        have(i) ||
        get("_roninStoragePulls")
          .split(",")
          .map((id) => toItem(toInt(id)))
          .includes(i),
      do: () => cliExecuteThrow(`pull ${i}`),
    };
    return task;
  });
}

export const gyouAscend: Task[] = [
  {
    name: "Ascend",
    completed: () => get("ascensionsToday") === 1,
    do: () => {
      ascend(
        $path`Grey You`,
        $class`Grey Goo`,
        Lifestyle.softcore,
        "blender",
        $item`astral six-pack`,
        $item`astral pet sweater`,
      );
      if (
        visitUrl("main.php").includes(
          "somewhat-human-shaped mass of grey goo nanites",
        )
      ) {
        runChoice(-1);
      }
    },
  },
];

// Every task after we complete loopgyou up till NS
export const GyouFarm: Quest<Task> = {
  name: "GYouFarm",
  tasks: [
    ...OrganQuest,
    {
      name: "Autumn-Aton",
      completed: () => AutumnAton.currentlyIn() !== null,
      do: () => AutumnAton.sendTo(autumnAtonZones),
      ready: () => AutumnAton.available(),
    },
    {
      name: "Level Fams + Farm",
      after: ["Azazel"],
      do: $location`Barf Mountain`,
      prepare: () => barfFarmSetup(),
      completed: () => myTurncount() >= 1000,
      outfit: () => {
        const familiar = getLevelingFamiliar();
        if (familiar !== $familiar`Hobo Monkey`) {
          return {
            offhand: $item`Kramco Sausage-o-Matic™`,
            acc1: $item`lucky gold ring`,
            familiar: familiar,
            modifier: "familiar exp",
          };
        } else {
          return {
            weapon: $item`June cleaver`,
            offhand:
              getKramcoWandererChance() >= 0.05
                ? $item`Kramco Sausage-o-Matic™`
                : $item`Half a Purse`,
            acc1: $item`lucky gold ring`,
            acc2: $item`Mr. Cheeng's spectacles`,
            acc3: $item`mafia thumb ring`,
            familiar: $familiar`Hobo Monkey`,
            modifier: "meat",
          };
        }
      },
      combat: new CombatStrategy().autoattack(gyouBarf),
    },
    {
      name: "Pull All",
      after: ["Level Fams + Farm"],
      completed: () =>
        myStorageMeat() === 0 &&
        storageAmount($item`festive warbear bank`) === 0,
      do: (): void => {
        cliExecute("pull all");
        cliExecute("refresh all");
      },
      limit: { tries: 1 },
    },
    {
      name: "FinishGyou",
      after: ["Pull All"],
      do: (): void => {
        cliExecuteThrow("loopgyou");
      },
      completed: () => step("questL13Final") >= 11,
    },
    // ============ GYOU FINISHED ============
    // {
    //   name: "Switch Work shed",
    //   after: ["FinishGyou"],
    //   ready: () => haveDNA(),
    //   do: (): void => {
    //     cliExecuteThrow("use Little Geneticist DNA-Splicing Lab");
    //   },
    //   completed: () => installedDNA(),
    // },
    // {
    //   name: "Get DNA",
    //   after: ["Switch Work shed"],
    //   do: $location`The Hole in the Sky`,
    //   combat: new CombatStrategy().autoattack(extractDNA),
    //   completed: () => get("dnaSyringe") === $phylum`constellation` || isHybridized(),
    //   limit: { tries: 1 },
    // },
    // {
    //   name: "Hybridize + Tonics",
    //   after: ["Get DNA"],
    //   do: () => {
    //     makeTonic(3);
    //     hybridize();
    //   },
    //   completed: () => isHybridized() && tonicsLeft() === 0,
    // },
    // Post ronin things
    {
      name: "Get Coin",
      after: ["Pull All"],
      do: () => {
        acquire(1, $item`box of Familiar Jacks`, 15000);
        useFamiliar($familiar`Cornbeefadon`);
        cliExecute("use box of Familiar Jacks");
      },
      completed: () =>
        have($item`amulet coin`) ||
        equippedItem($slot`familiar`) === $item`amulet coin`,
    },
    // Back to farming
    {
      name: "Post Ronin Farm",
      after: ["Get Coin"],
      do: $location`Barf Mountain`,
      completed: () => myAdventures() <= 40,
      prepare: () => {
        barfFarmSetup();
      },
      outfit: {
        back: $item`carpe`,
        weapon: $item`June cleaver`,
        offhand:
          getKramcoWandererChance() >= 0.05
            ? $item`Kramco Sausage-o-Matic™`
            : $item`Half a Purse`,
        acc1: $item`lucky gold ring`,
        acc2: $item`Mr. Cheeng's spectacles`,
        acc3: $item`mafia thumb ring`,
        familiar: $familiar`Hobo Monkey`,
        modifier: "meat",
      },
      combat: new CombatStrategy().autoattack(gyouBarf),
    },
    {
      name: "Prep And Choose Class",
      after: ["Post Ronin Farm"],
      do: (): void => {
        cliExecuteThrow("loopgyou class=1");
      },
      outfit: {
        hat: $item`Uncle Hobo's stocking cap`,
        back: $item`sea mantle`,
        weapon: $item`June cleaver`,
        offhand: $item`fake washboard`,
        pants: $item`designer sweatpants`,
        acc1: $item`World's Best Adventurer sash`,
        acc2: $item`backup camera`,
        acc3: $item`mime army insignia (infantry)`,
        modifier: "ml",
      },
      completed: () => myClass().toString() === "Seal Clubber",
      limit: { tries: 1 },
    },
  ],
  completed: () => myClass().toString() === "Seal Clubber",
};

export const Gyou: Quest<Task> = {
  name: "GYou",
  tasks: [
    ...gyouAscend,
    ...pull(pullItems),
    {
      name: "Set up workshet",
      do: () => cliExecute("use cold medicine cabinet"),
      completed: () =>
        getWorkshed() === $item`cold medicine cabinet` ||
        getWorkshed() === $item`model train set`,
    },
    {
      name: "Get Crown",
      do: (): void => {
        visitUrl("campground.php?action=workshed");
        runChoice(1);
      },
      completed: () =>
        itemAmount($item`ice crown`) === 1 ||
        equippedItem($slot`hat`) === $item`ice crown`,
      limit: { tries: 1 },
    },
    {
      name: "GYou",
      after: ["Get Crown"],
      do: (): void => {
        cliExecute("breakfast");
        if (have($item`one-day ticket to Dinseylandfill`)) {
          cliExecute("use one-day ticket to Dinseylandfill");
        }
        // cliExecute("acquire carpe");
        equip($familiar`Gelatinous Cubeling`, $item`tiny stillsuit`);
        cliExecuteThrow(
          "loopgyou chargegoose=20 swapworkshed='model train set'",
        );
      },
      completed: () => get("questL12War") === "finished",
      limit: { tries: 3 },
    },
  ],
  completed: () =>
    get("questL12War") === "finished" && get("ascensionsToday") === 1,
};
