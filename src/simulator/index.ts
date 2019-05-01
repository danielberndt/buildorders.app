import {resPerUnit, decayRates, villGatheringData} from "./info";
import {
  Res,
  GatherTypes,
  ResPatches,
  EnhancedResPatches,
  Instructions,
  Step,
  Entity,
  EnhancedResPatch,
  Task,
  TaskType,
  PropType,
  FindByType,
  StepDesc,
  Until,
  Constructions,
  Buildings,
  Units,
  Technologies,
} from "./types";
import {Modifiers} from "./defaultModifiers";
import {units, technologies, buildings, allEntities} from "./entities";

const cloneRes = (r: Res): Res => ({food: r.food, wood: r.wood, gold: r.gold, stone: r.stone});

const subtractInPlace = (r1: Res, r2: Res) => {
  r1.food += -r2.food;
  r1.wood += -r2.wood;
  r1.gold += -r2.gold;
  r1.stone += -r2.stone;
};

const multiply = (r1: Res, f: Res) => ({
  food: r1.food * f.food,
  wood: r1.wood * f.wood,
  gold: r1.gold * f.gold,
  stone: r1.stone * f.stone,
});

// thanks SOTL! https://www.youtube.com/watch?v=Hca1oSsOPh4
const resPerSecond = (
  capacity: number,
  distance: number,
  gatheringRate: number,
  walkingSpeedMultiplier: number
) => capacity / (capacity / gatheringRate + (2 * distance) / (0.8 * walkingSpeedMultiplier));

const gather = (type: GatherTypes, distance: number, modifiers: Modifiers) => {
  const {rawGatheringPerS, carryingCapacity} = villGatheringData[type];
  const {gatheringMultiplier, extraCarryingCapacity, extraCarryingMultiplier} = modifiers.gathering[
    type
  ];
  if (type === "farming") {
    // according to https://www.reddit.com/r/aoe2/comments/7d9b9k/some_updated_completed_farming_workrate_values/
    const rawRate = Math.min(
      24 / 60,
      resPerSecond(
        (carryingCapacity + extraCarryingCapacity) * extraCarryingMultiplier,
        4,
        rawGatheringPerS * gatheringMultiplier,
        modifiers.villagers.walkingSpeedMultiplier
      )
    );
    return resPerSecond(
      (carryingCapacity + extraCarryingCapacity) * extraCarryingMultiplier,
      distance,
      rawRate,
      modifiers.villagers.walkingSpeedMultiplier
    );
  } else {
    return resPerSecond(
      (carryingCapacity + extraCarryingCapacity) * extraCarryingMultiplier,
      distance,
      rawGatheringPerS * gatheringMultiplier,
      modifiers.villagers.walkingSpeedMultiplier
    );
  }
};

const nextIds: {[key: string]: number} = {};
const generateId = (type: string, name: string) => {
  const key = `${type}-${name[0]}`;
  if (!nextIds[key]) nextIds[key] = 0;
  return `${key}-${(nextIds[key] += 1)}`;
};

type TaskToDist = {
  [P in TaskType]?: (task: FindByType<Task, P>, resPatches: EnhancedResPatches) => number
};

const taskToDistance: TaskToDist = {
  build: (task, resPatches) => ("atRes" in task ? resPatches[task.atRes].distance : task.distance),
  gather: ({resId}, resPatches) => resPatches[resId].distance,
  lure: ({boarId}, resPatches) => resPatches[boarId].distance,
};

type TaskToStepDesc = {
  [P in TaskType]: (opts: {task: FindByType<Task, P>; resPatches: EnhancedResPatches}) => StepDesc
};

const taskToStepDesc: TaskToStepDesc = {
  build: ({task, resPatches}) => {
    const {type, building, id: maybeId} = task;
    const id = maybeId || generateId("build", building);
    return {
      type,
      building,
      id,
      isDepositAtRes: "atRes" in task ? task.atRes : null,
      distanceFromTC: "atRes" in task ? resPatches[task.atRes].distance : task.distance,
      until: [{type: "event", name: `buldingFinish-${id}`}],
    };
  },
  gather: ({task, resPatches}) => {
    const {type, resId, until} = task;
    const res = resPatches[resId];
    const {activity} = resPerUnit[res.type];

    return {
      type,
      resId,
      activity,
      resType: res.type,
      until: [...(until ? [until] : []), {type: "event", name: `resDepleted-${resId}`}],
    };
  },
  lure: ({task, resPatches}) => {
    const boar = resPatches[task.boarId];
    const walkDist = euclidianDist(boar.distance, 0) + 4; // need to run through tc
    return {
      type: "walk",
      luringBoarId: task.boarId,
      endLocation: 0,
      remainingDistance: walkDist,
      until: [{type: "atTarget"}],
    };
  },
  wait: ({task}) => {
    const {type, until} = task;
    return {type, until: [...(until ? [until] : [])]};
  },
  train: ({task}) => {
    const {type, unit, id: maybeId} = task;
    const id = maybeId || generateId("unit", unit);
    const info = units[unit];
    return {
      type,
      unit,
      id,
      remainingTime: info.trainingTime,
      until: [{type: "event", name: `trainingFinished-${id}`}],
    };
  },
  research: ({task}) => {
    const {type, technology} = task;
    const info = technologies[technology];
    return {
      type,
      technology,
      startTime: info.researchTime,
      remainingTime: info.researchTime,
      until: [{type: "researchAt", percentDone: 100, technology}],
      improves: info.improves,
    };
  },
};

const euclidianDist = (d1: number, d2: number) => (d1 * d1 + d2 * d2) ** 0.5;

const getNextStepDesc = (entity: Entity, state: State): StepDesc => {
  const nextTask = entity.remainingTasks.shift() || {type: "wait"};
  // check if we need to walk there first
  const distanceFn = taskToDistance[nextTask.type];
  if (distanceFn && entity.distanceFromTC !== null) {
    let walkDist: number;
    let taskDistFromTc: number;
    if (
      ("atRes" in nextTask && entity.atRes === nextTask.atRes) ||
      ("resId" in nextTask && entity.atRes === nextTask.resId)
    ) {
      walkDist = 3;
      taskDistFromTc = entity.distanceFromTC;
    } else {
      taskDistFromTc = distanceFn(nextTask as any, state.resPatches);
      walkDist = euclidianDist(entity.distanceFromTC, taskDistFromTc);
    }
    // console.log(nextTask);
    // console.log({walkDist, distanceFromTC: entity.distanceFromTC});
    if (walkDist > 0) {
      return {
        type: "walk",
        endLocation: taskDistFromTc,
        remainingDistance: walkDist,
        targetStepDesc: taskToStepDesc[nextTask.type]({
          task: nextTask as any,
          resPatches: state.resPatches,
        }),
        targetRes: "atRes" in nextTask ? nextTask.atRes : null,
        until: [...(nextTask.until ? [nextTask.until] : []), {type: "atTarget"}],
      };
    }
  }
  if (nextTask.type === "gather") {
    const res = state.resPatches[nextTask.resId];
    if (res.hpRemaining > 0) {
      return {
        type: "kill",
        boarId: nextTask.resId,
        targetStepDesc: taskToStepDesc[nextTask.type]({
          task: nextTask as any,
          resPatches: state.resPatches,
        }),
        until: [
          ...(nextTask.until ? [nextTask.until] : []),
          {type: "event", name: `killed-boar-${nextTask.resId}`},
        ],
      };
    }
  }
  return taskToStepDesc[nextTask.type]({
    task: nextTask as any,
    resPatches: state.resPatches,
  });
};

const getNextStep = (entity: Entity, state: State): Step => {
  const stepDesc = getNextStepDesc(entity, state);
  if (stepDesc.type === "train") {
    subtractInPlace(
      state.currRes,
      multiply(units[stepDesc.unit].cost, state.modifiers.entities[stepDesc.unit].costMultiplier)
    );
  } else if (stepDesc.type === "research") {
    subtractInPlace(
      state.currRes,
      multiply(
        technologies[stepDesc.technology].cost,
        state.modifiers.entities[stepDesc.technology].costMultiplier
      )
    );
  } else {
    let buildStep;
    if (stepDesc.type === "build") buildStep = stepDesc;
    if (!buildStep && "targetStepDesc" in stepDesc && stepDesc.targetStepDesc.type === "build") {
      buildStep = stepDesc.targetStepDesc;
    }
    if (buildStep) {
      const {id, building, isDepositAtRes, distanceFromTC} = buildStep;
      if (!state.constructions[id]) {
        const {constructionTime, cost} = buildings[building];
        state.constructions[id] = {
          builders: 0,
          timeLeft: constructionTime,
          building,
          isDepositAtRes,
          distance: distanceFromTC,
        };
        subtractInPlace(state.currRes, cost);
        state.events.add(`constructionAdded-${id}`);
      }
    }
  }
  return {desc: stepDesc, entity, start: state.time};
};

const processConditions = (step: Step, state: State): Step => {
  let currentStep = step;
  let i = 0;
  while (isStepCompleted(currentStep, state)) {
    i += 1;
    if ("targetStepDesc" in currentStep.desc) {
      const nextStepDesc = currentStep.desc.targetStepDesc;
      currentStep = {desc: nextStepDesc, entity: currentStep.entity, start: state.time};
    } else {
      currentStep = getNextStep(currentStep.entity, state);
    }
    if (i > 10) {
      console.log({currentStep});
      throw new Error("Cought in a loop!");
    }
  }
  return currentStep;
};

const enhanceRessources = (resPatches: ResPatches, modifiers: Modifiers) => {
  const enhanced: EnhancedResPatches = {};
  Object.entries(resPatches).forEach(([id, res]) => {
    const {activity, amount, hp} = resPerUnit[res.type];
    const count = "count" in res ? res.count : 1;
    enhanced[id] = {
      ...res,
      hasDeposit: false,
      resType: villGatheringData[activity].ressource,
      remaining: amount * count * modifiers.ressourceDurationMultiplier,
      hpRemaining: (hp || 0) * count,
    };
  });
  return enhanced;
};

const canAfford = (currRes: Res, cost: Res) => {
  return (
    currRes.food >= cost.food &&
    currRes.wood >= cost.wood &&
    currRes.gold >= cost.gold &&
    currRes.stone >= cost.stone
  );
};

type ConditionFulfilledObj = {
  [P in PropType<Until, "type">]: (opts: {
    cond: FindByType<Until, P>;
    step: Step;
    state: State;
  }) => boolean
};

const conditionFulfilled: ConditionFulfilledObj = {
  event: ({cond: {name}, state}) => state.events.has(name),
  atTarget: ({step}) =>
    "remainingDistance" in step.desc ? step.desc.remainingDistance === 0 : false,
  buildRes: ({cond: {entity}, state}) => {
    const {cost} = allEntities[entity];
    const mod = state.modifiers.entities[entity];
    return canAfford(state.currRes, multiply(cost, mod.costMultiplier));
  },
  researchAt: ({cond: {technology, percentDone}, state}) => {
    if (state.completedResearch.has(technology)) return true;
    const p = state.researchProgress[technology];
    return p !== undefined && p >= percentDone;
  },
};

const isStepCompleted = (step: Step, state: State) =>
  step.desc.until &&
  step.desc.until.some(cond => conditionFulfilled[cond.type]({cond: cond as any, step, state}));

const addEntity = (opts: {
  id: string;
  type: Buildings | Units;
  tasks?: Task[];
  distanceFromTC: number | null;
  state: State;
}) => {
  const {type, state, tasks, distanceFromTC, id} = opts;
  const entity: Entity = {
    id,
    type,
    category: type in units ? "unit" : "building",
    createdAt: state.time,
    steps: [],
    remainingTasks: tasks || [],
    distanceFromTC,
    atRes: null,
  };
  const info = allEntities[type];
  const mod = state.modifiers.entities[type];
  if ("popSpace" in info) {
    // is building
    state.maxPopSpace += Math.min(
      200,
      info.popSpace + ("extraPopSpace" in mod ? mod.extraPopSpace : 0)
    );
  }
  if ("trainingTime" in info) {
    // is unit
    state.popSpace += 1;
  }
  let firstStep = getNextStep(entity, state);
  const actualStep = processConditions(firstStep, state);
  entity.steps.push(actualStep);
  return entity;
};

const applyResearch = (improves: any, targetModifiers: any) => {
  Object.entries(improves).forEach(([key, val]: [any, any]) => {
    if (val.value && val.operation) {
      switch (val.operation) {
        case "add":
          targetModifiers[key] += val.value;
          break;
        case "multiply":
          targetModifiers[key] *= val.value;
          break;
      }
    } else {
      applyResearch(val, targetModifiers[key]);
    }
  });
};

type State = {
  time: number;
  currentSteps: Step[];
  resPatches: EnhancedResPatches;
  events: Set<string>;
  modifiers: Modifiers;
  currRes: Res;
  constructions: Constructions;
  entities: {[id: string]: Entity};
  popSpace: number;
  maxPopSpace: number;
  researchProgress: {[T in Technologies]?: number};
  completedResearch: Set<Technologies>;
};

export const simulateGame = (
  instructions: Instructions,
  duration: number,
  modifiers: Modifiers
) => {
  const resAndPopHistory: (Res & {maxPopSpace: number; popSpace: number})[] = [];

  const state: State = {
    currentSteps: [],
    constructions: {},
    currRes: cloneRes(instructions.startingRes),
    modifiers,
    resPatches: enhanceRessources(instructions.resPatches, modifiers),
    events: new Set(),
    time: 0,
    entities: {},
    popSpace: 0,
    maxPopSpace: 0,
    researchProgress: {},
    completedResearch: new Set(),
  };

  const decayableRes: {
    [id: string]: {decayRate: number; hasBeenTouched: boolean; patch: EnhancedResPatch};
  } = {};
  Object.entries(state.resPatches).forEach(([id, res]) => {
    if (res.type in decayRates) {
      decayableRes[id] = {
        decayRate: decayRates[res.type as keyof typeof decayRates],
        hasBeenTouched: false,
        patch: res,
      };
    }
  });

  Object.entries(instructions.entities).forEach(([id, {type}]) => {
    const entity = addEntity({
      id,
      type,
      tasks: instructions.tasks[id],
      distanceFromTC: type === "villager" ? 3 : null,
      state,
    });
    state.entities[id] = entity;
    const firstStep = entity.steps[0];
    if (firstStep.desc.until.length) state.currentSteps.push(firstStep);
  });

  for (; state.time < duration; state.time += 1) {
    state.researchProgress = {};
    const applyResearches = [];
    for (const res of Object.values(decayableRes)) {
      if (res.hasBeenTouched) {
        res.patch.remaining = Math.max(0, res.patch.remaining - res.decayRate);
        res.hasBeenTouched = false;
      }
    }

    for (const step of state.currentSteps) {
      const {desc} = step;
      if (desc.type === "build") {
        const {id} = desc;
        state.constructions[id].builders += 1;
      } else if (desc.type === "walk") {
        const {remainingDistance} = desc;
        const nextDist = remainingDistance - 0.8 * modifiers.villagers.walkingSpeedMultiplier;
        desc.remainingDistance = Math.max(0, nextDist);
        if (desc.remainingDistance === 0) {
          if ("luringBoarId" in desc) {
            const res = state.resPatches[desc.luringBoarId];
            res.distance = 0;
            res.hpRemaining -= 6;
            state.events.add(`lure_${desc.luringBoarId}`);
            step.entity.atRes = null;
          } else {
            step.entity.atRes = desc.targetRes;
          }
          step.entity.distanceFromTC = desc.endLocation;
        }
      } else if (desc.type === "gather") {
        const {resId, activity} = desc;
        const res = state.resPatches[resId];
        if (res.remaining >= 0) {
          const decayRes = decayableRes[resId];
          if (decayRes) decayRes.hasBeenTouched = true;
          let gatherAmount = gather(activity, res.hasDeposit ? 1 : res.distance, modifiers);
          res.remaining -= gatherAmount;
          if (res.remaining <= 0) {
            gatherAmount += res.remaining;
            res.remaining = 0;
            state.events.add(`resDepleted-${resId}`);
          }
          state.currRes[res.resType] += gatherAmount;
        }
      } else if (desc.type === "wait") {
      } else if (desc.type === "kill") {
        const res = state.resPatches[desc.boarId];
        res.hpRemaining = Math.max(
          0,
          res.hpRemaining - 1.5 * modifiers.villagers.boarKillingSpeedMultiplier
        );
        if (res.hpRemaining === 0) state.events.add(`killed-boar-${desc.boarId}`);
      } else if (desc.type === "research") {
        const {remainingTime, technology, startTime} = desc;
        // TODO: Add tech speed multipliers
        desc.remainingTime = Math.max(
          remainingTime - 1 * modifiers.entities[technology].researchSpeedMultiplier,
          0
        );
        state.researchProgress[technology] = (100 * (startTime - desc.remainingTime)) / startTime;
        if (desc.remainingTime === 0) {
          state.completedResearch.add(technology);
          if (desc.improves) applyResearches.push(desc.improves);
        }
      } else if (desc.type === "train") {
        const {remainingTime, unit, id} = desc;
        // TODO: Add unit train speed multipliers
        desc.remainingTime = Math.max(
          remainingTime - 1 * modifiers.entities[unit].trainingSpeedMultiplier,
          0
        );
        if (desc.remainingTime === 0) {
          state.events.add(`trainingFinished-${id}`);
          const entity = addEntity({
            id,
            type: unit,
            tasks: instructions.tasks[id] || [],
            distanceFromTC: unit === "villager" ? 0 : null,
            state,
          });
          state.entities[id] = entity;
          state.currentSteps.push(entity.steps[0]);
        }
      }
    }

    applyResearches.forEach(improves => applyResearch(improves, state.modifiers));

    for (const [id, construction] of Object.entries(state.constructions)) {
      if (construction.builders > 0) {
        construction.timeLeft -=
          construction.builders *
          (3 / (construction.builders + 2)) *
          modifiers.entities[construction.building].buildingSpeedMultiplier;
      }
      construction.builders = 0;
      if (construction.timeLeft <= 0) {
        state.events.add(`buldingFinish-${id}`);
        // maybe mark "resAt" ressource as non-tc walkable
        if (construction.building === "farm") {
          state.resPatches[id] = {
            type: "farm",
            distance: construction.distance,
            resType: "food",
            remaining:
              (resPerUnit.farm.amount + modifiers.farmExtraFood) *
              modifiers.ressourceDurationMultiplier,
            hasDeposit: false,
            hpRemaining: 0,
          };
        } else {
          const entity = addEntity({
            id,
            type: construction.building,
            tasks: instructions.tasks[id] || [],
            distanceFromTC: null,
            state,
          });
          state.entities[id] = entity;
          const firstStep = entity.steps[0];
          if (firstStep.desc.until.length) state.currentSteps.push(firstStep);

          if (construction.isDepositAtRes) {
            state.resPatches[construction.isDepositAtRes].hasDeposit = true;
          }
        }
        delete state.constructions[id];
      }
    }
    for (let i = 0; i < state.currentSteps.length; i += 1) {
      const step = state.currentSteps[i];
      const nextStep = processConditions(step, state);
      if (nextStep !== step) {
        state.currentSteps.splice(i, 1);
        i -= 1;
        if (nextStep.desc.until.length) state.currentSteps.push(nextStep);
        step.entity.steps.push(nextStep);
      }
    }
    resAndPopHistory.push({
      ...cloneRes(state.currRes),
      maxPopSpace: state.maxPopSpace,
      popSpace: state.popSpace,
    });
  }

  return {resAndPopHistory, entities: state.entities};
};
