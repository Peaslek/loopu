import { Task } from "./structure";
import { acquire, getRef, setRef } from "./utils";

/*

Used for testing different tasks before integrating

*/
import {
  Skill,
  adventure,
  cliExecute,
  currentPvpStances,
  getCampground,
  getPermedSkills,
  haveEffect,
  haveSkill,
  print,
  toSkill,
  use,
  useSkill,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $skill,
  $skills,
  Lifestyle,
  console,
  get,
  getModifier,
  have,
} from "libram";

type MallPrice = {
  formattedMallPrice: string;
  formattedLimitedMallPrice: string;
  formattedMinPrice: string;
  mallPrice: number;
  limitedMallPrice: number;
  minPrice: number | null;
};

export function test3() {
  console.log(getRef("ptrackStarted"));
  if (getRef("ptrackStarted") === "true") {
    console.log("It's true");
  }
}
export function test(): void {
  print("Start");
}

function test2(stance?: string) {
  if (stance === null || stance === undefined) {
    const stances = currentPvpStances();
    console.log(Object.keys(stances)[0]);
    // stance = stances.keys[0];
  }
  console.log(getCampground()["Clockwork maid"]);
  for (const key in Object.values(getCampground())) {
    // console.log(key);
    console.log(getCampground()["Dramatic™ range"]);
    // console.log(Object.values(getCampground())[key]);
  }
  console.log($familiar`Grey Goose`.experience);
  console.log(get("garbageChampagneCharge"));
}
