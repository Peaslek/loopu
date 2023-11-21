import { args } from "../../args";
import { glitch, nightcap, pajamas, sausage, swagger, tofu } from "../common";
import { Sloppy } from "../misc/sbb";
import { Quest } from "../structure";
import { getRef, setRef, totallyDrunk } from "../utils";
import { getTasks } from "grimoire-kolmafia";
import {
  cliExecute,
  inebrietyLimit,
  myAdventures,
  myInebriety,
  myTurncount,
  pvpAttacksLeft,
} from "kolmafia";
import { get, set } from "libram";

export function LongAftercore(): Quest {
  return {
    name: "Aftercore",
    tasks: [
      ...getTasks([Sloppy()]),
      glitch(),
      {
        name: "Breakfast",
        completed: () => get("breakfastCompleted"),
        do: () => cliExecute("breakfast"),
        tracking: "Breakfast",
      },
      tofu(),
      {
        name: "Garbo",
        prepare: () => cliExecute("acquire carpe"),
        do: (): void => {
          setRef("garboFarmingTurns", myTurncount());
          set("valueOfAdventure", args.voa);
          cliExecute(args.garboaftercore);
        },
        completed: () =>
          myAdventures() === 0 || myInebriety() > inebrietyLimit(),
        tracking: "Garbo",
      },
      {
        name: "Stop garbo Tracking",
        completed: () =>
          getRef("garboFarmingTurns") < 1000 && myAdventures() === 0,
        do: () => {
          const currentTurns = Number(get("garboFarmingTurns"));
          setRef("garboFarmingTurns", myTurncount() - currentTurns);
        },
      },
      sausage(),
      swagger(),
      pajamas(),
      nightcap(),
    ],
    completed: () =>
      pvpAttacksLeft() === 0 && totallyDrunk() && myAdventures() === 0,
  };
}
