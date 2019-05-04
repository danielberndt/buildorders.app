import {AllAgeModifiers, getDefaultModifiers, Modifiers} from "./defaultModifiers";
import {villGatheringData} from "./info";
import {RecursivePartial, GatherTypes, Buildings, Units, Technologies, Res} from "./types";
import {units, technologies, buildings} from "./entities";

type Civ = {
  modifiers: AllAgeModifiers;
};

type Ages = keyof AllAgeModifiers;
type Mod = {mod: RecursivePartial<Modifiers>; ages: Ages[]};

const applyPartialMod = (mod: any, targetPath: any) => {
  Object.entries(mod).forEach(([key, val]: [any, any]) => {
    if (Array.isArray(val) || typeof val !== "object") {
      targetPath[key] = val;
    } else {
      applyPartialMod(val, targetPath[key]);
    }
  });
};

const allAges = ["darkAge", "feudalAge", "castleAge", "imperialAge"] as Ages[];

const mod = (mod: RecursivePartial<Modifiers>, ...rawAges: Ages[]) => ({
  mod,
  ages: rawAges.length ? rawAges : allAges,
});
const applyMods = (...mods: Mod[]): AllAgeModifiers => {
  const defaultMods = getDefaultModifiers();
  mods.forEach(mod => mod.ages.forEach(age => applyPartialMod(mod.mod, defaultMods[age])));
  return defaultMods;
};

const unitsFrom = (building: Buildings) =>
  Object.entries(units)
    .filter(([k, {trainedIn}]) => trainedIn === building)
    .map(([k]) => k as Units);
const techsIn = (building: Buildings) =>
  Object.entries(technologies)
    .filter(([k, {researchedIn}]) => researchedIn === building)
    .map(([k]) => k as Technologies);

const asKeys = <K extends keyof T, T extends object, V>(keys: K[], val: V) => {
  return keys.reduce(
    (m, key) => {
      m[key] = val;
      return m;
    },
    {} as {[key in K]: V}
  );
};

const gatherings = Object.keys(villGatheringData) as GatherTypes[];
const allRes = (val: number): Res => ({food: val, wood: val, gold: val, stone: val});
const techsExceptAging = (Object.keys(technologies) as Technologies[]).filter(
  t => allAges.indexOf(t as any) === -1
);
const allBuildings = Object.keys(buildings) as Buildings[];

const civs: {[civ: string]: Civ} = {
  aztecs: {
    modifiers: applyMods(
      mod({extraRessources: {gold: 50}}, "darkAge"),
      mod({gathering: asKeys(gatherings, {extraCarryingCapacity: 5})})
    ),
  },

  berbers: {
    modifiers: applyMods(
      mod({villagers: {walkingSpeedMultiplier: 1.1}}),
      mod({entities: asKeys(unitsFrom("stable"), {costMultiplier: allRes(0.85)})}, "castleAge"),
      mod({entities: asKeys(unitsFrom("stable"), {costMultiplier: allRes(0.8)})}, "imperialAge")
    ),
  },

  britons: {
    modifiers: applyMods(
      mod({entities: {townCenter: {costMultiplier: {wood: 0.5}}}}, "castleAge", "imperialAge"),
      mod({gathering: {eatingSheep: {gatheringMultiplier: 1.25}}}),

      // team
      mod({entities: asKeys(unitsFrom("archeryRange"), {trainingSpeedMultiplier: 1.2})}),
      mod({entities: asKeys(techsIn("archeryRange"), {researchSpeedMultiplier: 1.2})})
    ),
  },

  burmese: {
    modifiers: applyMods(
      mod({entities: asKeys(techsIn("monastery"), {costMultiplier: allRes(0.5)})}),
      mod({freeTechs: ["doubleBitAxe"]}, "feudalAge"),
      mod({freeTechs: ["bowSaw"]}, "castleAge"),
      mod({freeTechs: ["twoManSaw"]}, "imperialAge")
    ),
  },

  byzantines: {
    modifiers: applyMods(
      mod({entities: {skirmisher: {costMultiplier: allRes(0.75)}}}),
      mod({entities: {spearman: {costMultiplier: allRes(0.75)}}}),
      mod({entities: {camel: {costMultiplier: allRes(0.75)}}}),
      mod({entities: {imperialAge: {costMultiplier: allRes(0.67)}}}),
      mod({freeTechs: ["townWatch"]}, "feudalAge")
    ),
  },

  celts: {
    modifiers: applyMods(
      mod({gathering: {cuttingWood: {gatheringMultiplier: 1.15}}}),

      // team
      mod({entities: asKeys(unitsFrom("siegeWorkshop"), {trainingSpeedMultiplier: 1.2})}),
      mod({entities: asKeys(techsIn("siegeWorkshop"), {researchSpeedMultiplier: 1.2})})
    ),
  },

  chinese: {
    modifiers: applyMods(
      mod({extraVillagerCount: 3}, "darkAge"),
      mod({extraRessources: {food: -200, wood: -50}}, "darkAge"),
      mod({entities: {townCenter: {extraPopSpace: 5}}}),
      mod({entities: asKeys(techsExceptAging, {costMultiplier: allRes(0.9)})}, "feudalAge"),
      mod({entities: asKeys(techsExceptAging, {costMultiplier: allRes(0.85)})}, "castleAge"),
      mod({entities: asKeys(techsExceptAging, {costMultiplier: allRes(0.8)})}, "imperialAge"),

      // team
      mod({farmExtraFood: 45})
    ),
  },

  ethopians: {
    modifiers: applyMods(
      mod({extraRessources: {food: 100, gold: 100}}, "feudalAge", "castleAge", "imperialAge"),
      mod({freeTechs: ["pikeman"]}, "castleAge")
    ),
  },

  franks: {
    modifiers: applyMods(
      mod({gathering: {foraging: {gatheringMultiplier: 1.25}}}),
      mod({entities: {castle: {costMultiplier: allRes(0.75)}}}),

      mod({freeTechs: ["horseCollar"]}, "feudalAge"),
      mod({freeTechs: ["heavyPlow"]}, "castleAge"),
      mod({freeTechs: ["cropRotation"]}, "imperialAge")
    ),
  },

  goths: {
    modifiers: applyMods(
      mod(
        {entities: asKeys(unitsFrom("barracks"), {costMultiplier: allRes(65)})},
        "feudalAge",
        "castleAge",
        "imperialAge"
      ),
      mod({gathering: {hunting: {extraCarryingCapacity: 15}}}),
      mod({villagers: {boarKillingSpeedMultiplier: 2}}),

      // team
      mod({entities: asKeys(unitsFrom("barracks"), {trainingSpeedMultiplier: 1.2})}),
      mod({entities: asKeys(techsIn("barracks"), {researchSpeedMultiplier: 1.2})})
    ),
  },

  huns: {
    modifiers: applyMods(
      mod({extraRessources: {wood: -100}, extraPopSpace: 200}, "darkAge"),
      mod({entities: {cavalryArcher: {costMultiplier: allRes(0.9)}}}, "castleAge"),
      mod({entities: {cavalryArcher: {costMultiplier: allRes(0.8)}}}, "imperialAge"),
      mod({entities: {genitour: {costMultiplier: allRes(0.9)}}}, "castleAge"),
      mod({entities: {genitour: {costMultiplier: allRes(0.8)}}}, "imperialAge"),
      // TODO: spies costs less

      // team
      mod({entities: asKeys(unitsFrom("stable"), {trainingSpeedMultiplier: 1.2})}),
      mod({entities: asKeys(techsIn("stable"), {researchSpeedMultiplier: 1.2})})
    ),
  },

  incas: {
    modifiers: applyMods(
      mod({entities: {house: {extraPopSpace: 5}}}),
      mod({entities: asKeys(allBuildings, {costMultiplier: {stone: 0.85}})}),
      // TODO: add free inca llama

      // team
      mod({entities: {farm: {buildingSpeedMultiplier: 2}}})
    ),
  },
};

export default civs;
