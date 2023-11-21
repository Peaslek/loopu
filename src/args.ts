import { Args } from "grimoire-kolmafia";

export const args = Args.create(
  "loopu",
  "Modified by (#1884174), Written by zincaito (#2125208), heavily inspired by work SketchySolid (#422389) did on goorbo. This is a full-day script for half-CS looping.",
  {
    //alternate-run flags
    version: Args.flag({
      help: "Output script version number and exit.",
      default: false,
      setting: "",
    }),
    aftercore: Args.flag({
      help: "Just run Aftercore leg",
      default: false,
      setting: "",
    }),
    cs: Args.flag({
      help: "Just run CS leg",
      default: false,
      setting: "",
    }),
    pcheck: Args.flag({
      help: "Check wish list items",
      default: false,
      setting: "",
    }),
    profit: Args.flag({
      help: "Show profits",
      default: false,
      setting: "",
    }),
    test: Args.flag({
      help: "Run test script",
      default: false,
      setting: "",
    }),
    debug: Args.flag({
      help: "Run in debug mode",
      default: false,
      setting: "",
    }),
    slop: Args.flag({
      help: "Run sloppy seconds farming",
      default: false,
      setting: "",
    }),
    lag: Args.flag({
      help: "Run antilag",
      default: false,
      setting: "",
    }),
    detail: Args.flag({
      help: "Detailed ptrack profits",
      default: false,
      setting: "ptrack list",
    }),
    //partial run args
    actions: Args.number({
      help: "Maximum number of actions to perform, if given. Can be used to execute just a few steps at a time.",
    }),
    quick: Args.boolean({
      help: "Run scripts quickly",
      default: false,
    }),
    abort: Args.string({
      help: "If given, abort during the prepare() step for the task with matching name.",
    }),
    clan: Args.string({
      help: "If given, ensure we're a member of this clan before starting quest.",
    }),
    pvp: Args.flag({
      help: "If true, break hippy stone and do pvp.",
      default: true,
    }),
    csscript: Args.string({
      help: "The command that will perform the Community Service run. Include arguments you'd like to pass to that script too.",
      default: "instantsccs",
      // default: "folgercs",
    }),
    garboaftercore: Args.string({
      help: "Aftercore Garbo command",
      default: "garbo workshed=train ascend ",
    }),
    garboaftercoreDrunk: Args.string({
      help: "Dunk Garbo pre CS command",
      default: "garbo ascend ",
    }),
    garbocs: Args.string({
      help: "Post CS garbo command",
      default: "garbo workshed=cmc ",
    }),
    voa: Args.string({
      help: "VOA for Garbo",
      default: "6500",
    }),
    voaDrunk: Args.string({
      help: "VOA while drunk",
      default: "5000",
    }),
  },
);
