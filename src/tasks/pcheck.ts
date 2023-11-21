import { numberWithCommas } from "./utils";
import { mallPrice, myMeat, print, toItem } from "kolmafia";
import { have } from "libram";

/*

Small script for monitoring goal items

All my stuff is stripped, sorry
*/

const IOTMS = [
  "Pantogram",
];

const ITEMS = [
  "Manual of Numberology",
];

type Investment = {
  name: string;
  price: number;
  quantity: number;
  profit?: number;
  mallPrice?: number;
};

const Investments: Investment[] = [
  {
    name: "Mr.Accessory",
    price: 20000000,
    quantity: 1,
  },
];

const meatPerDay = 8000000;

function sortMap(
  map: Map<string, string | number>,
): Map<string, string | number> {
  const sorted = new Map(
    [...map].sort((a, b) => {
      if (a[1] > b[1]) {
        return -1;
      }
      if (a[1] === b[1]) {
        return 0;
      }
      if (a[1] < b[1]) {
        return 1;
      }
      return 0;
    }),
  );
  return sorted;
}

export function investments(investments: Investment[], title: string): void {
  print();
  print(`==== ${title} Price Checks ===`);
  let totalItems = 0;
  investments.forEach((x) => {
    totalItems += x.quantity;
  });
  print(`Checking a total of ${totalItems} investments`, "orange");

  let totalCost = 0;
  let totalProfit = 0;
  let totalMeat = 0;
  for (const item of investments) {
    item.mallPrice = mallPrice(toItem(item.name));
    item.profit = item.mallPrice * item.quantity - item.quantity * item.price;
    totalProfit += item.profit;
    totalCost += item.price * item.quantity;
    totalMeat += item.mallPrice * item.quantity;
  }

  for (const item of investments) {
    print(
      `- ${item.name} (${item.quantity}): ${
        item.mallPrice * item.quantity
      } (${numberWithCommas(item.profit)} profit)`,
      "olive",
    );
  }
  print(`Total Cost: ${numberWithCommas(totalCost)}`);
  print(`Total Value: ${numberWithCommas(totalMeat)}`);
  print(`Total Profit: ${numberWithCommas(totalProfit)}`);
}

export function pcheck(
  toPrice: string[],
  title: string,
  goalItem: string,
): void {
  print();
  print(`==== ${title} Price Checks ===`);

  const prices: Map<string, string | number> = new Map();
  let total = 0;
  // Build a store before everything so it looks nice
  for (const item of toPrice) {
    prices.set(item, mallPrice(toItem(item)));
    if (!have(toItem(item))) {
      total += mallPrice(toItem(item));
    }
  }

  // Full printout
  const sorted = sortMap(prices);
  print(`Current Meat: ${numberWithCommas(myMeat())}`, "orange");
  for (const [key, value] of sorted) {
    print(`- ${key}: ${numberWithCommas(value)}`, "olive");
  }

  // Total time to farm
  const totalTime = Math.floor(total / meatPerDay);
  print(
    `Total cost: ${numberWithCommas(
      total,
    )}, which would take ${totalTime} days to farm`,
  );

  // Goal time to farm
  const goalRemaining = Number(sorted.get(goalItem)) - myMeat();
  const goalTime = Math.floor(goalRemaining / meatPerDay);
  print(
    `Meat left for ${goalItem}: ${numberWithCommas(
      goalRemaining,
    )}, which would take ${numberWithCommas(goalTime)} days to farm`,
  );
}

export function checks(): void {
  pcheck(IOTMS, "IOTM", "Pantogram");
  pcheck(ITEMS, "Item", "Manual of Numberology");
  investments(Investments, "Investments");
}
