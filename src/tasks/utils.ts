import { garboValue } from "../engine/profits";
import { Task } from "grimoire-kolmafia";
import {
  Item,
  Skill,
  buy,
  cliExecute,
  fullnessLimit,
  getCampground,
  getPermedSkills,
  haveEffect,
  inebrietyLimit,
  itemAmount,
  mallPrice,
  myAdventures,
  myFamiliar,
  myFullness,
  myHp,
  myInebriety,
  myMaxhp,
  mySpleenUse,
  print,
  restoreHp,
  spleenLimit,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $skills,
  Lifestyle,
  get,
  have,
  set,
  uneffect,
} from "libram";

export function maxBase(): string {
  return `175 bonus June Cleaver, ${
    garboValue($item`FunFunds™`) / 20 + 5
  } bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, ${
    0.4 * get("valueOfAdventure")
  } bonus mafia thumb ring, 10 bonus tiny stillsuit`;
}

export function numberWithCommas(x: number | string): string {
  let final: number;
  if (typeof x === "string") {
    final = Number(x);
  } else {
    final = x;
  }

  const str = final.toString();
  if (str.includes(".")) {
    return final.toFixed(2);
  }
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function canDiet(): boolean {
  return (
    myFullness() < fullnessLimit() ||
    mySpleenUse() < spleenLimit() ||
    myInebriety() < inebrietyLimit() ||
    (have($item`distention pill`) && !get("_distentionPillUsed")) ||
    (have($item`synthetic dog hair pill`) &&
      !get("_syntheticDogHairPillUsed")) ||
    (have($item`designer sweatpants`) &&
      get("_sweatOutSomeBoozeUsed") < 3 &&
      get("sweat") >= 25) ||
    (have($item`mime army shotglass`) && !get("_mimeArmyShotglassUsed")) ||
    (get("currentMojoFilters") < 3 &&
      mallPrice($item`mojo filter`) +
        mallPrice($item`transdermal smoke patch`) <
        2.5 * get("valueOfAdventure"))
  );
}

export function canConsume(): boolean {
  return (
    myFullness() < fullnessLimit() ||
    myInebriety() < inebrietyLimit() ||
    mySpleenUse() < spleenLimit()
  );
}

export function debug(message: string, color?: string): void {
  if (color) {
    print(message, color);
  } else {
    print(message);
  }
}

export function stooperDrunk(): boolean {
  return (
    myInebriety() > inebrietyLimit() ||
    (myInebriety() === inebrietyLimit() && myFamiliar() === $familiar`Stooper`)
  );
}

export function totallyDrunk(): boolean {
  return have($familiar`Stooper`) && myFamiliar() !== $familiar`Stooper`
    ? myInebriety() > inebrietyLimit() + 1
    : myInebriety() > inebrietyLimit();
}

export function inebrietyLimitIgnoreFamiliar() {
  return inebrietyLimit() - (myFamiliar() === $familiar`Stooper` ? 1 : 0);
}

export function doneAdventuring(): boolean {
  return (!canDiet() && myAdventures() === 0) || stooperDrunk();
}

const gardens = $items`packet of pumpkin seeds, Peppermint Pip Packet, packet of dragon's teeth, packet of beer seeds, packet of winter seeds, packet of thanksgarden seeds, packet of tall grass seeds, packet of mushroom spores, packet of rock seeds`;
export function getGarden(): Item {
  return gardens.find((it) => it.name in getCampground()) || $item`none`;
}

// Yoinked from Garbo
export function acquire(
  qty: number,
  item: Item,
  maxPrice?: number,
  throwOnFail = true,
): number {
  if (!item.tradeable || (maxPrice !== undefined && maxPrice <= 0)) {
    return 0;
  }
  if (maxPrice === undefined) {
    throw `No price cap for ${item.name}.`;
  }

  print(
    `Trying to acquire ${qty} ${item.plural}; max price ${maxPrice.toFixed(
      0,
    )}.`,
    "green",
  );

  if (qty * mallPrice(item) > 500000) {
    throw "Aggregate cost too high! Probably a bug.";
  }

  const startAmount = itemAmount(item);

  const remaining = qty - startAmount;
  if (remaining <= 0) {
    return qty;
  }
  if (maxPrice <= 0) {
    throw `buying disabled for ${item.name}.`;
  }

  buy(remaining, item, maxPrice);
  if (itemAmount(item) < qty && throwOnFail) {
    throw `Mall price too high for ${item.name}.`;
  }
  return itemAmount(item) - startAmount;
}

export function heal(limit = 0.5) {
  if (haveEffect($effect`Beaten Up`)) {
    uneffect($effect`Beaten Up`);
  }
  if (myHp() < myMaxhp() * limit) {
    restoreHp(myMaxhp() * 1);
  }
}

export function cliExecuteThrow(command: string) {
  if (!cliExecute(command)) {
    throw `Failed to execute ${command}`;
  }
}

/*
  Finds all unpermed skills, excluding softcore -> hardcore
  Builds a map based on the maximum karma we have with a limit
*/
export function getPerms(savedKarma = 1000): Map<Skill, Lifestyle> {
  const skills = new Map();
  const mySkills = getPermedSkills();
  const allSkills = $skills``;
  const karmaLimit = Math.max(get("bankedKarma") - savedKarma, 0);
  let permCost = 0;
  allSkills.forEach((skill) => {
    if (
      have(skill) &&
      skill.permable &&
      mySkills[skill.name] === undefined &&
      permCost < karmaLimit
    ) {
      skills.set(skill, Lifestyle.softcore);
      print(`Planning on perming ${skill}`);
      permCost += 100;
    }
  });
  print(`Karma spend: ${permCost}`);
  print(`Karma left: ${get("bankedKarma") - permCost}`);
  return skills;
}

/*

Various utils for setting custom prefs

*/

export function setrefTask(
  prop: string,
  value: boolean | number | string,
): Task {
  return {
    name: `Set ${prop}`,
    do: () => set(`_loopu_${prop}`, value),
    completed: () => get(prop) === `${value}`,
    limit: { tries: 1 },
  };
}

export function getRef(key: string): boolean | number | string {
  console.log(`Checking: _loopu_${key} pref`);
  return get(`_loopu_${key}`);
}

export function setRef(key: string, value: boolean | number | string): void {
  set(`_loopu_${key}`, value);
}
