import {AllAgeModifiers, getDefaultModifiers, Modifiers} from "./defaultModifiers";
import {villGatheringData} from "./info";
import {RecursivePartial, GatherTypes, Buildings, Units, Technologies, Res} from "./types";
import {units, technologies, buildings} from "./entities";

type Civ = {
  getModifiers: () => AllAgeModifiers;
  uniqueUnit: Units;
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
const applyMods = (...mods: Mod[]): (() => AllAgeModifiers) => {
  return () => {
    const defaultMods = getDefaultModifiers();
    mods.forEach(mod => mod.ages.forEach(age => applyPartialMod(mod.mod, defaultMods[age])));
    return defaultMods;
  };
};

const unitsFrom = (...buildings: Buildings[]) =>
  Object.entries(units)
    .filter(([k, {trainedIn}]) => buildings.includes(trainedIn))
    .map(([k]) => k as Units);
const techsIn = (...buildings: Buildings[]) =>
  Object.entries(technologies)
    .filter(([k, {researchedIn}]) => buildings.includes(researchedIn))
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
const allUnits = Object.keys(units) as Units[];

const civs: {[civ: string]: Civ} = {
  aztecs: {
    uniqueUnit: "jaguarWarrior",
    getModifiers: applyMods(
      mod({extraRessources: {gold: 50}}, "darkAge"),
      mod({gathering: asKeys(gatherings, {extraCarryingCapacity: 5})})
    ),
  },

  berbers: {
    uniqueUnit: "camelArcher",
    getModifiers: applyMods(
      mod({villagers: {walkingSpeedMultiplier: 1.1}}),
      mod({entities: asKeys(unitsFrom("stable"), {costMultiplier: allRes(0.85)})}, "castleAge"),
      mod({entities: asKeys(unitsFrom("stable"), {costMultiplier: allRes(0.8)})}, "imperialAge")
    ),
  },

  britons: {
    uniqueUnit: "longbowman",
    getModifiers: applyMods(
      mod({entities: {townCenter: {costMultiplier: {wood: 0.5}}}}, "castleAge", "imperialAge"),
      mod({gathering: {eatingSheep: {gatheringMultiplier: 1.25}}}),

      // team
      mod({entities: asKeys(unitsFrom("archeryRange"), {trainingSpeedMultiplier: 1.2})}),
      mod({entities: asKeys(techsIn("archeryRange"), {researchSpeedMultiplier: 1.2})})
    ),
  },

  burmese: {
    uniqueUnit: "arambai",
    getModifiers: applyMods(
      mod({entities: asKeys(techsIn("monastery"), {costMultiplier: allRes(0.5)})}),
      mod({freeTechs: ["doubleBitAxe"]}, "feudalAge"),
      mod({freeTechs: ["bowSaw"]}, "castleAge"),
      mod({freeTechs: ["twoManSaw"]}, "imperialAge")
    ),
  },

  byzantines: {
    uniqueUnit: "catapharact",
    getModifiers: applyMods(
      mod({entities: {skirmisher: {costMultiplier: allRes(0.75)}}}),
      mod({entities: {spearman: {costMultiplier: allRes(0.75)}}}),
      mod({entities: {camel: {costMultiplier: allRes(0.75)}}}),
      mod({entities: {imperialAge: {costMultiplier: allRes(0.67)}}}),
      mod({freeTechs: ["townWatch"]}, "feudalAge")
    ),
  },

  celts: {
    uniqueUnit: "woadRaider",
    getModifiers: applyMods(
      mod({gathering: {cuttingWood: {gatheringMultiplier: 1.15}}}),

      // team
      mod({entities: asKeys(unitsFrom("siegeWorkshop"), {trainingSpeedMultiplier: 1.2})}),
      mod({entities: asKeys(techsIn("siegeWorkshop"), {researchSpeedMultiplier: 1.2})})
    ),
  },

  chinese: {
    uniqueUnit: "choKoNu",
    getModifiers: applyMods(
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
    uniqueUnit: "shotelWarrior",
    getModifiers: applyMods(
      mod({extraRessources: {food: 100, gold: 100}}, "feudalAge", "castleAge", "imperialAge"),
      mod({freeTechs: ["pikeman"]}, "castleAge")
    ),
  },

  franks: {
    uniqueUnit: "throwingAxeman",
    getModifiers: applyMods(
      mod({gathering: {foraging: {gatheringMultiplier: 1.25}}}),
      mod({entities: {castle: {costMultiplier: allRes(0.75)}}}),

      mod({freeTechs: ["horseCollar"]}, "feudalAge"),
      mod({freeTechs: ["heavyPlow"]}, "castleAge"),
      mod({freeTechs: ["cropRotation"]}, "imperialAge")
    ),
  },

  goths: {
    uniqueUnit: "huskarl",
    getModifiers: applyMods(
      mod(
        {entities: asKeys([...unitsFrom("barracks"), "huskarl"], {costMultiplier: allRes(0.65)})},
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
    uniqueUnit: "tarkan",
    getModifiers: applyMods(
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
    uniqueUnit: "kamayuk",
    getModifiers: applyMods(
      mod({entities: {house: {extraPopSpace: 5}}}),
      mod({entities: asKeys(allBuildings, {costMultiplier: {stone: 0.85}})}),
      // TODO: add free inca llama

      // team
      mod({entities: {farm: {buildingSpeedMultiplier: 2}}})
    ),
  },

  indians: {
    uniqueUnit: "elephantArcher",
    getModifiers: applyMods(
      mod({entities: {villager: {costMultiplier: allRes(0.9)}}}, "darkAge"),
      mod({entities: {villager: {costMultiplier: allRes(0.85)}}}, "feudalAge"),
      mod({entities: {villager: {costMultiplier: allRes(0.8)}}}, "castleAge"),
      mod({entities: {villager: {costMultiplier: allRes(0.75)}}}, "imperialAge"),
      mod({gathering: {fishing: {gatheringMultiplier: 1.15, extraCarryingCapacity: 15}}})
    ),
  },

  italians: {
    uniqueUnit: "genoeseCrossbowman",
    getModifiers: applyMods(
      mod({
        entities: asKeys(["feudalAge", "castleAge", "imperialAge"], {costMultiplier: allRes(0.85)}),
      }),
      mod({
        entities: asKeys(["handCannoneer", "bombardCannon", "cannonGalleon"], {
          costMultiplier: allRes(0.8),
        }),
      }),
      mod({entities: asKeys(techsIn("dock"), {costMultiplier: allRes(0.5)})}),
      mod({entities: {fishingShip: {costMultiplier: allRes(0.85)}}})
    ),
  },

  japanese: {
    uniqueUnit: "samurai",
    getModifiers: applyMods(
      mod({entities: asKeys(["lumberCamp", "miningCamp", "mill"], {costMultiplier: allRes(0.5)})})
    ),
    // TODO: add fishing ship
  },

  khmer: {
    uniqueUnit: "ballistaElephant",
    getModifiers: applyMods(),
  },

  koreans: {
    uniqueUnit: "warWagon",
    getModifiers: applyMods(
      mod({entities: asKeys(["castle", "stoneWall"], {buildingSpeedMultiplier: 1.33})}),
      mod({entities: {watchTower: {buildingSpeedMultiplier: 1.05}}}),
      mod({gathering: {miningStone: {gatheringMultiplier: 1.2}}}),

      mod({freeTechs: ["guardTower"]}, "castleAge"),
      mod({freeTechs: ["keep", "bombardTowerTech"]}, "imperialAge")
    ),
  },

  magyars: {
    uniqueUnit: "magyarHuszar",
    getModifiers: applyMods(
      mod({freeTechs: ["forging"]}, "feudalAge"),
      mod({freeTechs: ["ironCasting"]}, "castleAge"),
      mod({freeTechs: ["blastFurnace"]}, "imperialAge"),
      mod({entities: {scoutCavalry: {costMultiplier: allRes(0.85)}}})
    ),
  },

  malay: {
    uniqueUnit: "karambitWarrior",
    getModifiers: applyMods(
      mod({
        entities: asKeys(["feudalAge", "castleAge", "imperialAge"], {researchSpeedMultiplier: 1.8}),
      }),
      mod({entities: {fishTrap: {costMultiplier: allRes(0.67)}}})
      //TODO: add fishtrap bonus
    ),
  },

  malians: {
    uniqueUnit: "gbeto",
    getModifiers: applyMods(
      mod({
        entities: asKeys(allBuildings.filter(b => b !== "farm"), {costMultiplier: {wood: 0.85}}),
      }),
      mod({freeTechs: ["goldMining"]}, "feudalAge"),
      // team
      mod({entities: asKeys(techsIn("university"), {researchSpeedMultiplier: 1.8})})
    ),
  },

  mayans: {
    uniqueUnit: "plumedArcher",
    getModifiers: applyMods(
      mod({extraVillagerCount: 1, extraRessources: {food: -50}}, "darkAge"),
      mod({ressourceDurationMultiplier: 1.15}),
      mod(
        {entities: asKeys(["archer", "plumedArcher"], {costMultiplier: allRes(0.9)})},
        "feudalAge"
      ),
      mod(
        {entities: asKeys(["archer", "plumedArcher"], {costMultiplier: allRes(0.8)})},
        "castleAge"
      ),
      mod(
        {entities: asKeys(["archer", "plumedArcher"], {costMultiplier: allRes(0.7)})},
        "imperialAge"
      ),

      // team
      mod({entities: {stoneWall: {costMultiplier: allRes(0.5)}}})
    ),
  },

  mongolians: {
    uniqueUnit: "mangudai",
    getModifiers: applyMods(mod({gathering: {hunting: {gatheringMultiplier: 1.5}}})),
  },

  persians: {
    uniqueUnit: "warElephant",
    getModifiers: applyMods(
      mod({extraRessources: {food: 50, wood: 50}}, "darkAge"),
      mod(
        {entities: asKeys(techsIn("townCenter", "dock"), {researchSpeedMultiplier: 1.1})},
        "feudalAge"
      ),
      mod(
        {entities: asKeys(unitsFrom("townCenter", "dock"), {trainingSpeedMultiplier: 1.1})},
        "feudalAge"
      ),
      mod(
        {entities: asKeys(techsIn("townCenter", "dock"), {researchSpeedMultiplier: 1.15})},
        "castleAge"
      ),
      mod(
        {entities: asKeys(unitsFrom("townCenter", "dock"), {trainingSpeedMultiplier: 1.15})},
        "castleAge"
      ),
      mod(
        {entities: asKeys(techsIn("townCenter", "dock"), {researchSpeedMultiplier: 1.2})},
        "imperialAge"
      ),
      mod(
        {entities: asKeys(unitsFrom("townCenter", "dock"), {trainingSpeedMultiplier: 1.2})},
        "imperialAge"
      )
    ),
  },

  portuguese: {
    uniqueUnit: "organGun",
    getModifiers: applyMods(
      mod({entities: asKeys(allUnits, {costMultiplier: {gold: 0.85}})}),

      // team
      mod({freeTechs: ["cartography"]})
    ),
  },

  saracens: {
    uniqueUnit: "mameluke",
    getModifiers: applyMods(mod({entities: {market: {costMultiplier: {wood: 100 / 175}}}})),
  },

  spanish: {
    uniqueUnit: "conquistador",
    getModifiers: applyMods(
      mod({entities: asKeys(allBuildings, {buildingSpeedMultiplier: 1.3})}),
      mod({entities: asKeys(techsIn("blacksmith"), {costMultiplier: {gold: 0}})})
    ),
  },

  slavs: {
    uniqueUnit: "boyar",
    getModifiers: applyMods(
      mod({gathering: {farming: {gatheringMultiplier: 1.15}}}),
      mod({freeTechs: ["tracking"]}, "feudalAge"),
      mod({entities: asKeys(unitsFrom("siegeWorkshop"), {costMultiplier: allRes(0.85)})}),

      // team
      mod({
        entities: asKeys(["barracks", "archeryRange", "stable", "siegeWorkshop"], {
          extraPopSpace: 5,
        }),
      })
    ),
  },

  teutons: {
    uniqueUnit: "teutonicKnight",
    getModifiers: applyMods(
      mod({freeTechs: ["murderHoles"]}, "castleAge"),
      mod({entities: {farm: {costMultiplier: allRes(0.67)}}})
    ),
  },

  turks: {
    uniqueUnit: "janissary",
    getModifiers: applyMods(
      mod({
        entities: asKeys(["bombardTowerTech", "cannonGalleonTech", "eliteCannonGalleon"], {
          costMultiplier: allRes(0.5),
        }),
      }),
      mod({freeTechs: ["lightCavalry"]}, "imperialAge"),
      mod({freeTechs: ["chemistry", "hussar"]}, "imperialAge"),
      mod({gathering: {miningGold: {gatheringMultiplier: 1.2}}}),

      // team
      // TODO: add all special units
      mod({
        entities: asKeys(["bombardCannon", "handCannoneer", "cannonGalleon", "janissary"], {
          trainingSpeedMultiplier: 1.2,
        }),
      })
    ),
  },

  vietnamese: {
    uniqueUnit: "rattanArcher",
    getModifiers: applyMods(mod({freeTechs: ["conscription"]}, "imperialAge")),
  },

  vikings: {
    uniqueUnit: "berserk",
    getModifiers: applyMods(
      mod(
        {
          entities: asKeys(["galley", "demolitionRaft", "fireGalley", "cannonGalleon"], {
            costMultiplier: allRes(0.85),
          }),
        },
        "feudalAge",
        "castleAge"
      ),
      mod(
        {
          entities: asKeys(["galley", "demolitionRaft", "fireGalley", "cannonGalleon"], {
            costMultiplier: allRes(0.8),
          }),
        },
        "imperialAge"
      ),
      mod({freeTechs: ["wheelbarrow"]}, "feudalAge"),
      mod({freeTechs: ["handCart"]}, "castleAge"),

      // team
      mod({entities: {dock: {costMultiplier: allRes(0.85)}}})
    ),
  },
};

export default civs;
