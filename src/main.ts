import { args } from "./args";
import { Engine } from "./engine/engine";
import { AftercoreCSQuest } from "./tasks/instantcs/aftercore";
import { CSQuests } from "./tasks/instantcs/communityservice";
import { Sloppy } from "./tasks/misc/sbb";
import { checks } from "./tasks/pcheck";
import { Task } from "./tasks/structure";
import { test } from "./tasks/test";
import { Args, getTasks } from "grimoire-kolmafia";
import { cliExecute, print } from "kolmafia";
const version = "1.2.0";

export async function main(command?: string): Promise<number> {
  Args.fill(args, command);
  if (args.help) {
    print(`loopu v${version}`);
    Args.showHelp(args);
    return 0;
  }

  print(`Running: loopu v${version}`);

  let tasks: Task[];
  const currentFarming = getTasks([AftercoreCSQuest(), ...CSQuests()]);

  if (args.aftercore) {
    tasks = getTasks([AftercoreCSQuest()]);
  } else if (args.cs) {
    tasks = getTasks([...CSQuests()]);
  } else if (args.slop) {
    tasks = getTasks([Sloppy()]);
  } else if (args.pcheck) {
    checks();
  } else if (args.lag) {
    cliExecute("antilag");
  } else if (args.test) {
    test();
  } else if (args.detail) {
    cliExecute("ptrack dcompare loopu loopu_end");
  } else if (args.profit) {
    tasks = [];
  } else {
    // run our current farming strategy
    tasks = currentFarming;
  }

  if (tasks === null || tasks === undefined) {
    return 0;
  }

  // Modify all garbo commands
  if (args.quick) {
    args.garboaftercore += " quick";
    args.garbocs += " quick";
    args.garboaftercoreDrunk += " quick";
  }

  // Abort during the prepare() step of the specified task
  if (args.abort) {
    const to_abort = tasks.find((task) => task.name === args.abort);
    if (!to_abort) {
      throw `Unable to identify task ${args.abort}`;
    }
    to_abort.prepare = (): void => {
      throw "Abort requested";
    };
  }

  const engine = new Engine(tasks, [], "loopu tracker");
  if (tasks.length === 0) {
    engine.destruct();
    return 0;
  }

  print(`Running ${tasks.length} tasks`);
  try {
    engine.run(args.actions);
    // Print the next task that will be executed, if it exists
    const task = engine.getNextTask();
    if (task) {
      print(`Next: ${task.name}`, "olive");
    }

    // If the engine ran to completion, all tasks should be complete.
    // Print any tasks that are not complete.
    if (args.actions === undefined) {
      const uncompletedTasks = engine.tasks.filter((t) => !t.completed());
      if (uncompletedTasks.length > 0) {
        print("Uncompleted Tasks:");
        for (const t of uncompletedTasks) {
          print(t.name);
        }
      }
    }
  } finally {
    engine.destruct();
  }

  return 0;
}
