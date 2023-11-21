import { args } from "../../args";
import {
  beach,
  clipArt,
  getFishy,
  glitch,
  nightcap,
  sausage,
  scepterProfit,
  startPtrack,
  swagger,
  tofu,
} from "../common";
import { Leg, Quest, getCurrentLeg } from "../structure";
import {
  canConsume,
  cliExecuteThrow,
  getGarden,
  stooperDrunk,
  totallyDrunk,
} from "../utils";
import {
  cliExecute,
  getCampground,
  getClanName,
  myAdventures,
  pvpAttacksLeft,
  use,
} from "kolmafia";
import { $item, get, have, set } from "libram";

export function AftercoreCSQuest(): Quest {
  return {
    name: "Aftercore",
    completed: () =>
      (myAdventures() === 0 && totallyDrunk() && pvpAttacksLeft() === 0) ||
      getCurrentLeg() === Leg.CommunityService,
    tasks: [
      startPtrack(),
      {
        name: "Join VIP Clan",
        completed: () =>
          !args.clan || getClanName().toLowerCase() === args.clan.toLowerCase(),
        do: () => cliExecute(`/whitelist ${args.clan}`),
      },
      {
        name: "Breakfast",
        completed: () => get("breakfastCompleted"),
        do: () => cliExecute("breakfast"),
        tracking: "Breakfast",
      },
      {
        name: "Harvest Garden",
        completed: () =>
          getGarden() === $item`none` ||
          getGarden() === $item`packet of mushroom spores` ||
          getCampground()[getGarden().name] === 0,
        do: () => cliExecute("garden pick"),
        tracking: "Breakfast",
        limit: { tries: 3 },
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
      clipArt(),
      tofu(),
      glitch(),
      beach(),
      scepterProfit(true, 5),
      {
        name: "Garbo",
        completed: () =>
          (get("_garboCompleted", "") !== "" &&
            myAdventures() === 0 &&
            !canConsume()) ||
          stooperDrunk(),
        prepare: () => {
          cliExecuteThrow("acquire carpe");
        },
        do: () => {
          set("valueOfAdventure", args.voa);
          cliExecute(args.garboaftercore);
        },
        tracking: "garbo",
        limit: { tries: 1 },
      },
      sausage(23),
      nightcap(args.voaDrunk),
      {
        name: "Garbo Drunk",
        completed: () => myAdventures() === 0 && totallyDrunk(),
        ready: () => myAdventures() !== 0 && totallyDrunk(),
        do: () => {
          set("valueOfAdventure", args.voaDrunk);
          cliExecute(args.garboaftercoreDrunk);
        },
        tracking: "garbo drunk",
        limit: { tries: 1 },
      },
      swagger(),
    ],
  };
}
