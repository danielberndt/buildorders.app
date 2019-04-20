import {GatherTypes, Buildings, Res, Technologies, Units} from "./types";
import {villGatheringData} from "./info";
import {buildings, technologies, units} from "./entities";

export type Modifiers = ReturnType<typeof getDefaultOneAge>;

const getDefaultOneAge = () => ({
  extraRessources: {food: 0, wood: 0, stone: 0, gold: 0},
  freeTechs: {}, // {towncenter: ["loom"]}
  farmExtraFood: 0,
  ressourceDurationMultiplier: 1,

  gathering: Object.keys(villGatheringData).reduce((m: any, key) => {
    m[key] = {gatheringMultiplier: 1, extraCarryingCapacity: 0};
    return m;
  }, {}) as {[key in GatherTypes]: {gatheringMultiplier: number; extraCarryingCapacity: number}},
  villagers: {
    walkingSpeedMultiplier: 1,
  },
  entities: {
    ...(Object.keys(buildings).reduce((m: any, key) => {
      m[key] = {
        costMultiplier: {food: 1, wood: 1, gold: 1, stone: 1},
        buildingSpeedMultiplier: 1,
      };
      return m;
    }, {}) as {[key in Buildings]: {costMultiplier: Res; buildingSpeedMultiplier: number}}),
    ...(Object.keys(technologies).reduce((m: any, key) => {
      m[key] = {
        costMultiplier: {food: 1, wood: 1, gold: 1, stone: 1},
        researchSpeedMultiplier: 1,
      };
      return m;
    }, {}) as {[key in Technologies]: {costMultiplier: Res; researchSpeedMultiplier: number}}),
    ...(Object.keys(units).reduce((m: any, key) => {
      m[key] = {
        costMultiplier: {food: 1, wood: 1, gold: 1, stone: 1},
        trainingSpeedMultiplier: 1,
      };
      return m;
    }, {}) as {[key in Units]: {costMultiplier: Res; trainingSpeedMultiplier: number}}),
  },
});

export const getDefaultModifiers = () => ({
  darkAge: getDefaultOneAge(),
  feudalAge: getDefaultOneAge(),
  castleAge: getDefaultOneAge(),
  imperialAge: getDefaultOneAge(),
});
