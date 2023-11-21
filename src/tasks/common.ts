import { args } from "../args";
import { highLevelMonster } from "./combat";
import { Task } from "./structure";
import { acquire, cliExecuteThrow, getRef, setRef } from "./utils";
import { CombatStrategy } from "grimoire-kolmafia";
import {
  Effect,
  Item,
  Location,
  adv1,
  adventure,
  canAdventure,
  cliExecute,
  count,
  create,
  currentPvpStances,
  drink,
  eat,
  getCampground,
  getClanId,
  haveEffect,
  haveSkill,
  hippyStoneBroken,
  inebrietyLimit,
  itemAmount,
  mallPrice,
  myAdventures,
  myFamiliar,
  myFullness,
  myInebriety,
  myLevel,
  mySessionMeat,
  mySpleenUse,
  pvpAttacksLeft,
  runCombat,
  toInt,
  toItem,
  toSkill,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $phylum,
  $skill,
  Clan,
  Macro,
  get,
  getModifier,
  have,
  haveInCampground,
  set,
  withChoice,
} from "libram";
import {
  installed as installedDNA,
  isHybridized,
  makeTonic,
  tonicsLeft,
} from "libram/dist/resources/2014/DNALab";
import {
  getTodayCast,
  todaysSkill,
} from "libram/dist/resources/2023/AugustScepter";

/*
  Collection of tasks to run during special events, etc.
  Not large farming scripts, just independent tasks
 */
export function dailies(task: string) {
  const taskMap = {
    pre: [breakfast(), scepterProfit(), clipArt(), glitch(), tofu()],
    post: [
      swagger(null, "pvp", true),
      sausage(),
      distillate(),
      nightcap(),
      pajamas(),
    ],
    nightcap: [nightcap(), pajamas()],
  };
  return taskMap[task];
}

/*
Wrap a task and explicitly mark its after task
 */
export function after(task: Task, after: string): Task {
  if (task.after !== null) {
    task.after.push(after);
  } else {
    task.after = [after];
  }
  return task;
}

export function glitch(): Task {
  return {
    name: "Glitch",
    do: () => {
      visitUrl("inv_eat.php?pwd&whichitem=10207");
      runCombat();
    },
    completed: () => get("_glitchItemImplemented") === true,
    post: () => set("_glitchItemImplemented", true),
    combat: new CombatStrategy().autoattack(highLevelMonster),
    limit: { tries: 1 },
  };
}

export function carpe(): Task {
  return {
    name: "Grab Carpe",
    ready: () => false,
    do: () => {
      const clan = "The Floundry";
      const start = getClanId();
      Clan.join(clan);
      cliExecute("acquire carpe");
      Clan.join(start);
    },
    completed: () => itemAmount($item`carpe`) === 1,
    limit: { tries: 1 },
  };
}

export function tofu(): Task {
  return {
    name: "Eat tofu",
    do: () => {
      acquire(1, $item`essential tofu`, 40000);
      use($item`essential tofu`);
    },
    ready: () => get("_essentialTofuUsed") === false,
    completed: () => get("_essentialTofuUsed") === true,
    limit: { tries: 1 },
    tracking: "garbo",
  };
}

export function pull(items: Item[]): Task[] {
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
      tracking: "ignore",
    };
    return task;
  });
}

/*
  Ensure we make/eat at least x sausages
 */
export function sausage(count = 23): Task {
  return {
    name: "Make Sausage",
    completed: () =>
      (get("_sausagesEaten") === count && get("_sausagesMade") >= count) ||
      itemAmount($item`Magical sausage casing`) === 0,
    do: () => {
      const eaten = get("_sausagesEaten");
      const made = get("_sausagesMade");
      const have = itemAmount($item`magical sausage`);
      const avail = itemAmount($item`Magical sausage casing`);

      let toEat = Math.min(count - eaten, avail);
      const toMake = Math.min(count - made + have, avail);

      console.log(`Making ${toMake} sausage`);
      console.log(`Planning to eat ${toEat} sausage`);

      if (count > 23) {
        toEat = 23;
      }

      if (toMake > 0) {
        cliExecute(`acquire ${toMake} magical sausage`);
      }
      if (toEat > 0) {
        cliExecute(`eat ${toEat} magical sausage`);
      }
    },
    limit: { tries: 1 },
    tracking: "sausage",
  };
}

export function sweat(): Task {
  return {
    name: "Sweat it all out",
    do: () => {
      while (get("sweat", 0) >= 25 && get("_sweatOutSomeBoozeUsed", 0) < 3) {
        useSkill($skill`Sweat Out Some Booze`);
      }
    },
    completed: () =>
      get("sweat", 0) < 25 || get("_sweatOutSomeBoozeUsed", 0) === 3,
    limit: { tries: 1 },
  };
}

export function consume(voa = 5000): Task {
  return {
    name: "consume",
    do: () => {
      cliExecute(`CONSUME ALL VALUE ${voa}`);
    },
    completed: () =>
      myFullness() >= 15 && myInebriety() >= 15 && mySpleenUse() >= 15,
    limit: { tries: 1 },
  };
}

export function nightcap(voa?: number | string): Task {
  if (voa === undefined) {
    // rome-ignore lint/style/noParameterAssign: <Come on>
    voa = args.voa;
  }
  const task: Task = {
    name: "Nightcap",
    ready: () => myInebriety() === inebrietyLimit() && myAdventures() === 0,
    do: () => {
      cliExecuteThrow("cast ode");
      useFamiliar($familiar`Stooper`);
      cliExecute(`CONSUME NIGHTCAP VALUE ${voa}`);
    },
    completed: () => myInebriety() > inebrietyLimit(),
    tracking: "nightcap",
    limit: { tries: 1 },
  };
  return task;
}

/*
  Set up rollover
 */
export function pajamas(): Task {
  const task: Task = {
    name: "Pajamas",
    completed: () => getRef("pajamasOn") === true,
    acquire: [
      {
        item: $item`clockwork maid`,
        price: 7 * get("valueOfAdventure"),
        optional: true,
        useful: () => {
          return haveInCampground($item`clockwork maid`) === false;
        },
      },
    ],
    ready: () => myInebriety() >= inebrietyLimit(),
    outfit: () => ({
      familiar: $familiar`Left-Hand Man`,
      acc1: $item`Sasq™ watch`,
      acc2: $item`Spacegate scientist's insignia`,
      offhand: $item`green LavaCo Lamp™`,
      modifier: "adventures",
    }),
    do: () => {
      if (have($item`clockwork maid`)) {
        use($item`clockwork maid`);
      }
      cliExecute("cast Aug. 13th: Left/Off Hander's Day!");
      setRef("pajamasOn", true);
    },
    tracking: "nightcap",
    limit: { tries: 1 },
  };

  return task;
}

export function breakfast(): Task {
  return {
    name: "Breakfast",
    do: () => cliExecute("breakfast"),
    completed: () => get("breakfastCompleted") || get("lastBreakfast") !== -1,
    limit: { tries: 1 },
  };
}

// Get Fishy, for free or a clover
export function getFishy(useClover = false): Task {
  return {
    name: "Get Fishy",
    do: () => {
      if (!canAdventure($location`The Brinier Deepers`)) {
        visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman");
      }

      if (haveEffect($effect`Lucky!`) === 0) {
        if (useClover) {
          acquire(1, $item`11-leaf clover`, 30000);
          use($item`11-leaf clover`);
        } else if (
          haveSkill($skill`Aug. 2nd: Find an Eleven-Leaf Clover Day`)
        ) {
          useSkill($skill`Aug. 2nd: Find an Eleven-Leaf Clover Day`);
        } else {
          console.log("Can't get Lucky!");
          throw "uhhh";
        }
      }

      if (haveEffect($effect`Fishy`) === 0) {
        if (haveEffect($effect`Lucky!`) > 0) {
          adventure(1, $location`The Brinier Deepers`);
        } else {
          console.log("Unable to get Lucky!");
          throw "uhh";
        }
      }

      if (haveEffect($effect`Fishy`) > 0) {
        setRef("haveFishy", true);
      }
    },
    outfit: () => ({
      familiar: $familiar`Urchin Urchin`,
      hat: $item`Mer-kin Mask`,
      offhand: $item`august scepter`, // Force unequip from lefty
    }),
    completed: () =>
      haveEffect($effect`Fishy`) > 0 ||
      getRef("haveFishy") === true ||
      getRef("haveFishy") === "true",
    limit: { tries: 1 },
  };
}

// Make some profitable scepter calls that
// don't require anything else, for aftercore
export function scepterProfit(rollerCoaster = true, maxCasts = 5): Task {
  return {
    name: "Cast Scepter Skills",
    completed: () =>
      getRef("scepterSkillsCast") === true ||
      getRef("scepterSkillsCast") === "true",
    do: () => {
      let casts = get("_augSkillsCast", 0);

      // Eat some food
      const food = $item`jumping horseradish`;
      const roller = $skill`Aug. 16th: Roller Coaster Day!`;
      if (rollerCoaster && haveSkill(roller)) {
        acquire(1, food, 10000);
        acquire(1, $item`milk of magnesium`, 5000);
        use($item`milk of magnesium`);
        eat(food);
        useSkill(roller);
        casts++;
      }

      //  Buffs/items
      const skills = [
        "Aug. 24th: Waffle Day!",
        "Aug. 7th: Lighthouse Day!",
        "Aug. 18th: Serendipity Day!",
        "Aug. 4th: Water Balloon Day!",
      ];
      for (const skill of skills) {
        if (casts < maxCasts) {
          if (haveSkill(toSkill(skill))) {
            useSkill(toSkill(skill));
            casts++;
          }
        }
        // If we've already had 5 casts, go ahead and cast the free
        if (casts === 5 && getTodayCast()) {
          useSkill(todaysSkill());
        }
      }

      setRef("scepterSkillsCast", true);
    },
    tracking: "Scepter",
  };
}

// Support custom items, for weird markets
export function clipArt(custom = true, item = "Box of Familiar Jacks"): Task {
  return {
    name: "Summon Clip Art",
    ready: () => have($skill`Summon Clip Art`),
    completed: () => $skill`Summon Clip Art`.dailylimit === 0,
    tracking: "CLip Art",
    do: (): void => {
      if (custom) {
        cliExecute(`try; create ${$skill`Summon Clip Art`.dailylimit} ${item}`);
      } else {
        let best = $item.none;
        for (let itemId = 5224; itemId <= 5283; itemId++) {
          const current = Item.get(`[${itemId}]`);
          if (mallPrice(current) > mallPrice(best)) {
            best = current;
          }
        }
        if (best !== $item.none) {
          cliExecute(
            `try; create ${$skill`Summon Clip Art`.dailylimit} ${best}`,
          );
        }
      }
    },
  };
}

export function beach(): Task {
  return {
    name: "Beach Access",
    completed: () => have($item`bitchin' meatcar`),
    do: () => create($item`bitchin' meatcar`),
    tracking: "garbo",
  };
}

export function breakStone(): Task {
  return {
    name: "BreakStone",
    completed: () => hippyStoneBroken(),
    do: () => visitUrl("peevpee.php?action=smashstone&pwd&confirm=on", true),
  };
}

export function Marg(): Task {
  return {
    name: "Drink",
    do: () => {
      cliExecute("drink Steel margarita");
    },
    completed: () => haveSkill($skill`Liver of Steel`) === true,
    ready: () => myLevel() >= 5,
    limit: { tries: 1 },
  };
}

export function swagger(
  stance?: string,
  tracking = "pvp",
  bStone = false,
): Task {
  // Break the stone if unbroken
  if (breakStone) {
    if (!hippyStoneBroken()) {
      visitUrl("peevpee.php?action=smashstone&pwd&confirm=on", true);
    }
  }
  // Pick the first stance if none are given
  if (stance === null || stance === undefined) {
    const stances = currentPvpStances();
    // rome-ignore lint/style/noParameterAssign: <Come on>
    stance = Object.keys(stances)[0];
  }

  const task: Task = {
    name: "Swagger",
    ready: () => pvpAttacksLeft() > 0,
    completed: () => pvpAttacksLeft() === 0,
    do: () => {
      if (!get("_fireStartingKitUsed") && have($item`CSA fire-starting kit`)) {
        withChoice(595, 1, () => {
          use($item`CSA fire-starting kit`);
        });
      }
      acquire(3, $item`Meteorite-Ade`, 10000, false);
      use($item`School of Hard Knocks Diploma`);
      while (get("_meteoriteAdesUsed") < 3 && have($item`Meteorite-Ade`)) {
        use($item`Meteorite-Ade`);
      }
      cliExecuteThrow(`pvp loot ${stance}`);
    },
    limit: { tries: 1 },
    tracking: tracking,
  };

  return task;
}

export function startPtrack(point = "loopu"): Task {
  return {
    name: "Start ptrack",
    do: () => {
      cliExecuteThrow(`ptrack add ${point}`);
      setRef("ptrackStarted", true);
    },
    completed: () =>
      getRef("ptrackStarted") === true || getRef("ptrackStarted") === "true",
    limit: { tries: 1 },
  };
}

export function endPtrack(point = "loopu_end"): Task {
  return {
    name: "End ptrack",
    do: () => {
      cliExecuteThrow(`ptrack add ${point}`);
      setRef("ptrackEnded", true);
    },
    completed: () =>
      getRef("ptrackEnded") === true || getRef("ptrackEnded") === "true",
    limit: { tries: 1 },
  };
}

export function distillate(): Task {
  return {
    name: "Distillate",
    ready: () => myInebriety() === inebrietyLimit(),
    do: () => cliExecuteThrow("drink stillsuit distillate"),
    outfit: {
      familiar: $familiar`Stooper`,
    },
    completed: () =>
      (myInebriety() === inebrietyLimit() &&
        myFamiliar() === $familiar`Stooper`) ||
      myInebriety() > inebrietyLimit(),
  };
}

export function trackSessionMeat(key: string): Task {
  return {
    name: "SessionMeat",
    do: () => set(`session${key}`, mySessionMeat()),
    completed: () => get(`session${key}`, 0) !== 0,
  };
}

export function clockwork(): Task {
  let tooExpensive = false;
  return {
    name: "Clockwork Maid",
    ready: () => getModifier("Adventures") + 40 < 200,
    completed: () =>
      !!getCampground()["clockwork maid"] || tooExpensive === true,
    do: () => {
      if (!have($item`clockwork maid`)) {
        acquire(1, $item`clockwork maid`, 5000 * 7, false);
      }
      if (have($item`clockwork maid`)) {
        use($item`clockwork maid`);
      } else {
        tooExpensive = true;
      }
    },
    limit: { tries: 1 },
  };
}

export function pvpNightCap(): Task {
  return {
    name: "PVP Nightcap",
    do: () => {
      // Could use consume, but this is basically always the best nightcap
      // TODO - add stooper?
      acquire(1, $item`5-hour acrimony`, 2500);
      drink($item`5-hour acrimony`, 1);
    },
    completed: () => myInebriety() > inebrietyLimit(),
    post: () => {
      cliExecute("maximize adv");
    },
    limit: { tries: 1 },
  };
}

export function d4(): Task {
  return {
    name: "Cheat",
    do: () => {
      acquire(100, $item`d4`, 500000);
      use($item`d4`, 100);
    },
    completed: () => myLevel() > 9,
    prepare: () => {
      cliExecute("wield weapon June Cleaver");
    },
    combat: new CombatStrategy().autoattack(highLevelMonster),
    post: () => {
      cliExecute("gain 2000 mainstat 20 turns 20000 maxmeatspent");
    },
    limit: { tries: 1 },
  };
}

export function Malware(): Task[] {
  return [
    {
      name: "Get Malware",
      completed: () => have($item`daily dungeon malware`),
      do: () => {
        // Potentially add logic for bacon machine?
        cliExecuteThrow("acquire daily dungeon malware");
      },
      limit: { tries: 1 },
    },
    {
      name: "Get Token",
      after: ["Get Malware"],
      do: $location`The Daily Dungeon`,
      choices: { 692: 2, 693: 2, 690: 2, 691: 2, 689: 1 },
      completed: () => get("_dailyDungeonMalwareUsed") !== false,
      prepare: () => useFamiliar($familiar`Gelatinous Cubeling`),
      // combat: new CombatStrategy().autoattack(malware),
      outfit: {
        weapon: $item`June cleaver`,
        acc1: $item`ring of Detect Boring Doors`,
        modifier: "meat",
        familiar: $familiar`Gelatinous Cubeling`,
      },
      limit: { turns: 1 },
    },
  ];
}

// Set up DNA machine
export function DNA(): Task[] {
  const extractDNA = new Macro()
    .item($item`DNA extraction syringe`)
    .attack()
    .repeat();

  return [
    {
      name: "Get DNA",
      ready: () => installedDNA(),
      do: $location`The Hole in the Sky`,
      combat: new CombatStrategy().autoattack(extractDNA),
      completed: () =>
        get("dnaSyringe") === $phylum`constellation` || isHybridized(),
      limit: { tries: 1 },
    },
    {
      name: "Make tonics",
      after: ["Get DNA"],
      ready: () => get("dnaSyringe") === $phylum`constellation`,
      do: () => {
        makeTonic(3);
      },
      completed: () => tonicsLeft() === 0,
    },
  ];
}
