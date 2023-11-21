import { familiarWeight, myAdventures } from "kolmafia";
import { $familiar, $item, $location, $skill, Macro } from "libram";

export function killAndRepeat() {
  return new Macro().attack().repeat();
}

export function gyouBarf() {
  /*
  Combat while in goo form
  Stop using bowl straight up so we have it for teacups
 */
  let mac = new Macro().trySkill($skill`Sing Along`);

  if (myAdventures() >= 100) {
    mac = mac.trySkill($skill`Bowl Straight Up`);
  }

  mac = mac.trySkill($skill`Double Nanovision`).attack().repeat();

  return mac;
}

export function useGoose() {
  /*
   TODO: Handle classes mainstat
   */
  return new Macro().skill($skill`Convert Matter to Protein`).attack().repeat();
}

export function malware() {
  return new Macro().item($item`daily dungeon malware`).attack().repeat();
}

export function highLevelMonster() {
  /*
    Stun forever and kill
   */
  return new Macro().item($item`gob of wet hair`, $item`gas can`).repeat();
}

export function extractDNA() {
  /*
    Grab DNA and kill for now
   */
  return new Macro().item($item`DNA extraction syringe`).attack().repeat();
}
