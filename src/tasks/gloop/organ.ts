import { CombatStrategy, Task, step } from "grimoire-kolmafia";
import { Item, itemAmount, toInt, useFamiliar, visitUrl } from "kolmafia";
import { $familiar, $item, $items, $location, have } from "libram";

import { gyouBarf } from "../combat";

export const OrganQuest: Task[] = [
  {
    name: "Start",
    completed: () => step("questM10Azazel") >= 0,
    do: (): void => {
      visitUrl("pandamonium.php?action=temp");
      visitUrl("pandamonium.php?action=sven");
    },
    limit: { tries: 1 },
    prepare: () => {
      useFamiliar($familiar`Grey Goose`);
    },
    outfit: { skipDefaults: true },
  },
  {
    name: "Bus",
    after: ["Start"],
    completed: (): boolean => {
      if (step("questM10Azazel") === 999) {
        return true;
      }
      if (have($item`Azazel's tutu`)) {
        return true;
      }
      const count = (items: Item[]) =>
        items.reduce((sum, item) => sum + itemAmount(item), 0);
      if (count($items`bus pass`) < 5) {
        return false;
      }
      return true;
    },
    do: $location`Infernal Rackets Backstage`,
    combat: new CombatStrategy().autoattack(gyouBarf),
    limit: { tries: 20 },
    outfit: { skipDefaults: true },
  },
  {
    name: "Imp Air",
    after: ["Start"],
    completed: (): boolean => {
      if (step("questM10Azazel") === 999) {
        return true;
      }
      if (have($item`Azazel's tutu`)) {
        return true;
      }
      const count = (items: Item[]) =>
        items.reduce((sum, item) => sum + itemAmount(item), 0);
      if (count($items`imp air`) < 5) {
        return false;
      }
      return true;
    },
    do: $location`The Laugh Floor`,
    limit: { tries: 20 },
    combat: new CombatStrategy().autoattack(gyouBarf),
    outfit: { skipDefaults: true },
  },
  {
    name: "Tutu",
    after: ["Bus", "Imp Air"],
    completed: () =>
      have($item`Azazel's tutu`) || step("questM10Azazel") === 999,
    do: () => visitUrl("pandamonium.php?action=moan"),
    limit: { tries: 2 },
  },
  {
    name: "Arena",
    after: ["Tutu"],
    completed: (): boolean => {
      if (step("questM10Azazel") === 999) {
        return true;
      }
      if (have($item`Azazel's unicorn`)) {
        return true;
      }

      const count = (items: Item[]) =>
        items.reduce((sum, item) => sum + itemAmount(item), 0);
      if (
        count(
          $items`giant marshmallow, beer-scented teddy bear, gin-soaked blotter paper`,
        ) < 2
      ) {
        return false;
      }
      if (count($items`booze-soaked cherry, comfy pillow, sponge cake`) < 2) {
        return false;
      }
      return true;
    },
    do: $location`Infernal Rackets Backstage`,
    combat: new CombatStrategy().autoattack(gyouBarf),
    limit: { soft: 30 },
    outfit: { skipDefaults: true },
  },
  {
    name: "Unicorn",
    after: ["Arena"],
    completed: () =>
      have($item`Azazel's unicorn`) || step("questM10Azazel") === 999,
    do: (): void => {
      const goals: { [name: string]: Item[] } = {
        Bognort: $items`giant marshmallow, gin-soaked blotter paper`,
        Stinkface: $items`beer-scented teddy bear, gin-soaked blotter paper`,
        Flargwurm: $items`booze-soaked cherry, sponge cake`,
        Jim: $items`comfy pillow, sponge cake`,
      };
      visitUrl("pandamonium.php?action=sven");
      for (const member of Object.keys(goals)) {
        if (goals[member].length === 0) {
          throw `Unable to solve Azazel's arena quest`;
        }
        const item = have(goals[member][0])
          ? toInt(goals[member][0])
          : toInt(goals[member][1]);
        visitUrl(
          `pandamonium.php?action=sven&bandmember=${member}&togive=${item}&preaction=try`,
        );
      }
    },
    limit: { tries: 1 },
    outfit: { skipDefaults: true },
  },
  {
    name: "Comedy Club",
    after: ["Start"],
    completed: () => have($item`observational glasses`),
    do: $location`The Laugh Floor`,
    outfit: { skipDefaults: true },
    combat: new CombatStrategy().autoattack(gyouBarf),
    limit: { soft: 30 },
  },
  {
    name: "Lollipop",
    after: ["Comedy Club"],
    completed: () =>
      have($item`Azazel's lollipop`) || step("questM10Azazel") === 999,
    do: () => visitUrl("pandamonium.php?action=mourn&preaction=observe"),
    outfit: { equip: $items`observational glasses`, skipDefaults: true },
    limit: { tries: 1 },
  },
  {
    name: "Azazel",
    after: ["Tutu", "Unicorn", "Lollipop"],
    completed: () => step("questM10Azazel") === 999,
    do: () => visitUrl("pandamonium.php?action=temp"),
    limit: { tries: 1 },
    outfit: { skipDefaults: true },
  },
];
