import { args } from "../../args";
import { CombatStrategy, Quest, Task, getTasks } from "grimoire-kolmafia";
import {
  cliExecute,
  equippedItem,
  inebrietyLimit,
  itemDropModifier,
  myAdventures,
  myInebriety,
  myTurncount,
  pvpAttacksLeft,
  use,
  useFamiliar,
} from "kolmafia";
import {
  $familiar,
  $item,
  $location,
  $slot,
  Macro,
  get,
  have,
  set,
} from "libram";

import { glitch, nightcap, sausage, swagger } from "../common";
import { acquire, cliExecuteThrow, heal } from "../utils";

function malware() {
  return new Macro().item($item`daily dungeon malware`).attack().repeat();
}

export const Malware: Task[] = [
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
    combat: new CombatStrategy().autoattack(malware),
    outfit: {
      weapon: $item`June cleaver`,
      acc1: $item`ring of Detect Boring Doors`,
      modifier: "meat",
      familiar: $familiar`Gelatinous Cubeling`,
    },
    limit: { turns: 1 },
  },
];

export const Aftercore: Quest<Task> = {
  name: "Aftercore",
  tasks: [
    glitch(),
    {
      after: ["Glitch"],
      name: "Garbo",
      do: (): void => {
        set("garboFarmingTurns", myTurncount());
        cliExecuteThrow("acquire carpe");
        cliExecuteThrow("garbo yachtzeechain 120");
      },
      completed: () => myAdventures() <= 120,
    },
    {
      after: ["Garbo"],
      name: "Garbo CMC",
      do: (): void => {
        cliExecuteThrow("use Cold Medicine Cabinet");
        cliExecuteThrow("garbo ");
      },
      completed: () => myAdventures() === 0,
    },
    sausage(23),
    nightcap(args.voaDrunk),
    {
      after: ["Nightcap"],
      name: "Garbo Nightcap",
      do: (): void => {
        cliExecuteThrow("garbo ascend");
      },
      completed: () => myAdventures() === 0 && myInebriety() > inebrietyLimit(),
    },
    {
      name: "Stop garbo Tracking",
      after: ["Garbo CMC"],
      completed: () =>
        get("garboFarmingTurns", 0) < 1000 && myAdventures() === 0,
      do: () => {
        const currentTurns = get("garboFarmingTurns", 0);
        set("garboFarmingTurns", myTurncount() - currentTurns);
      },
    },
    swagger(),
  ],
  completed: () => pvpAttacksLeft() === 0,
};
