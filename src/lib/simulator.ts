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
} from "./types";
import {Modifiers} from "./defaultModifiers";
import {units, technologies, buildings} from "./entities";

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
  const {gatheringMultiplier, extraCarryingCapacity} = modifiers.gathering[type];
  if (type === "farming") {
    // according to https://www.reddit.com/r/aoe2/comments/7d9b9k/some_updated_completed_farming_workrate_values/
    const rawRate = Math.min(
      24 / 60,
      resPerSecond(
        carryingCapacity + extraCarryingCapacity,
        4,
        rawGatheringPerS * gatheringMultiplier,
        modifiers.villagers.walkingSpeedMultiplier
      )
    );
    return resPerSecond(
      carryingCapacity + extraCarryingCapacity,
      distance,
      rawRate,
      modifiers.villagers.walkingSpeedMultiplier
    );
  } else {
    return resPerSecond(
      carryingCapacity + extraCarryingCapacity,
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
  lure: ({boarId}, resPatches) => resPatches[boarId].distance + 4, // because we've got arrows, but need to run through tc
};

type TaskToStepDesc = {
  [P in TaskType]: (opts: {
    task: FindByType<Task, P>;
    entity: Entity;
    resPatches: EnhancedResPatches;
  }) => StepDesc
};

const taskToStepDesc: TaskToStepDesc = {
  build: ({task}) => {
    const {type, building, id: maybeId} = task;
    const id = maybeId || generateId("build", building);
    return {
      type,
      building,
      id,
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
      until: [...(until ? [until] : []), {type: "event", name: `resDepleted-${resId}`}],
    };
  },
  lure: ({task, entity}) => {
    const walkDist = euclidianDist(entity.distanceFromTC || 0, 0);
    const {boarId} = task;
    return {
      type: "walk",
      luringBoarId: boarId,
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
      remainingTime: info.researchTime,
      until: [{type: "event", name: `researchFinished-${technology}`}],
    };
  },
};

const euclidianDist = (d1: number, d2: number) => (d1 * d1 + d2 * d2) ** 0.5;

const getNextStepDesc = (entity: Entity, state: State): StepDesc => {
  const nextTask = entity.remainingTasks[0] || {type: "wait"};
  // check if we need to walk there first
  const distanceFn = taskToDistance[nextTask.type];
  if (nextTask !== entity.atTaskLocation && distanceFn && entity.distanceFromTC !== null) {
    const taskDistFromTc = distanceFn(nextTask as any, state.resPatches);
    const walkDist = euclidianDist(entity.distanceFromTC, taskDistFromTc);
    if (walkDist > 0) {
      return {
        type: "walk",
        endLocation: taskDistFromTc,
        remainingDistance: walkDist,
        targetTask: nextTask,
        until: [{type: "atTarget"}],
      };
    } else {
      entity.atTaskLocation = nextTask;
    }
  }
  entity.remainingTasks.shift();
  return taskToStepDesc[nextTask.type]({
    entity,
    task: nextTask as any,
    resPatches: state.resPatches,
  });
};

const getNextStep = (entity: Entity, state: State): Step => {
  const taskDesc = getNextStepDesc(entity, state);
  if (taskDesc.type === "train") {
    subtractInPlace(
      state.currRes,
      multiply(units[taskDesc.unit].cost, state.modifiers.entities[taskDesc.unit].costMultiplier)
    );
  } else if (taskDesc.type === "research") {
    subtractInPlace(
      state.currRes,
      multiply(
        technologies[taskDesc.technology].cost,
        state.modifiers.entities[taskDesc.technology].costMultiplier
      )
    );
  }
  return {desc: taskDesc, entity, start: state.time};
};

const processConditions = (step: Step, state: State): Step => {
  let currentStep = step;
  while (isStepCompleted(currentStep, state)) {
    currentStep = getNextStep(step.entity, state);
  }
  return currentStep;
};

const allEntities = {...units, ...buildings, ...technologies};

const enhanceRessources = (resPatches: ResPatches, modifiers: Modifiers) => {
  const enhanced: EnhancedResPatches = {};
  Object.entries(resPatches).forEach(([id, res]) => {
    const {activity, amount} = resPerUnit[res.type];
    enhanced[id] = {
      ...res,
      resType: villGatheringData[activity].ressource,
      remaining: amount * ("count" in res ? res.count : 1) * modifiers.ressourceDurationMultiplier,
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
};

const isStepCompleted = (step: Step, state: State) =>
  step.desc.until &&
  step.desc.until.some(cond => conditionFulfilled[cond.type]({cond: cond as any, step, state}));

const addEntity = (opts: {
  id: string;
  type: Buildings | Units;
  tasks: Task[];
  distanceFromTC: number | null;
  state: State;
}) => {
  const {type, state, tasks, distanceFromTC, id} = opts;
  const entity: Entity = {
    id,
    type,
    createdAt: state.time,
    steps: [],
    remainingTasks: tasks,
    distanceFromTC,
    atTaskLocation: null,
  };
  let firstStep = getNextStep(entity, state);
  const actualStep = processConditions(firstStep, state);
  entity.steps.push(actualStep);
  return entity;
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
};

export const simulateGame = (
  instructions: Instructions,
  duration: number,
  modifiers: Modifiers
) => {
  const resHistory: Res[] = [];

  const state: State = {
    currentSteps: [],
    constructions: {},
    currRes: cloneRes(instructions.startingRes),
    modifiers,
    resPatches: enhanceRessources(instructions.resPatches, modifiers),
    events: new Set(),
    time: 0,
    entities: {},
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

  /*
  loop:

  - do spoilage for sheep/deer/boars that have been gathered from in last tick.
  - mark res as non-gathered

  - perform tasks
    - gathering: set `gathered-this-tick` flag, make sure you res not depleted yet, add event if depeleted
    - building:
      - check if construction id already exists,
      - if not, subtract res, create construction entitiy with HP,
      - add builder to each construction
    - walk:
      - subtract remainingDistance
      - if luring, update boar distance
      - if done
        - lure: fire event "lure_${boarId}"
        - if endLocation, update ent.distanceFromTC

  - calc construction progress
    - add to HP per builder, add event & entity if completed

  - check if end/until conditions are met
    - getNextTask check if end/until conditions are met
  */

  for (; state.time < duration; state.time += 1) {
    for (const res of Object.values(decayableRes)) {
      if (res.hasBeenTouched) {
        res.patch.remaining = Math.max(0, res.patch.remaining - res.decayRate);
        res.hasBeenTouched = false;
      }
    }

    for (const step of state.currentSteps) {
      const {desc} = step;
      if (desc.type === "build") {
        const {id, building} = desc;
        if (!state.constructions[id]) {
          const {constructionTime, cost} = buildings[building];
          state.constructions[id] = {builders: 0, timeLeft: constructionTime, building};
          subtractInPlace(state.currRes, cost);
        }
        state.constructions[id].builders += 1;
      } else if (desc.type === "walk") {
        const {remainingDistance} = desc;
        const nextDist = remainingDistance - 0.8 * modifiers.villagers.walkingSpeedMultiplier;
        desc.remainingDistance = Math.max(0, nextDist);
        if (desc.remainingDistance === 0) {
          if ("luringBoarId" in desc) {
            state.resPatches[desc.luringBoarId].distance = 0;
            state.events.add(`lure_${desc.luringBoarId}`);
          } else {
            step.entity.atTaskLocation = desc.targetTask;
          }
          step.entity.distanceFromTC = desc.endLocation;
        }
      } else if (desc.type === "gather") {
        const {resId, activity} = desc;
        const res = state.resPatches[resId];
        if (res.remaining >= 0) {
          const decayRes = decayableRes[resId];
          if (decayRes) decayRes.hasBeenTouched = true;
          let gatherAmount = gather(activity, res.distance, modifiers);
          res.remaining -= gatherAmount;
          if (res.remaining <= 0) {
            gatherAmount += res.remaining;
            res.remaining = 0;
            state.events.add(`resDepleted-${resId}`);
          }
          state.currRes[res.resType] += gatherAmount;
        }
      } else if (desc.type === "wait") {
      } else if (desc.type === "research") {
        const {remainingTime, technology} = desc;
        // TODO: Add tech speed multipliers
        desc.remainingTime = Math.max(
          remainingTime - 1 * modifiers.entities[technology].researchSpeedMultiplier,
          0
        );
        if (desc.remainingTime === 0) {
          state.events.add(`researchFinished-${technology}`);
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
    resHistory.push(cloneRes(state.currRes));
  }

  return {resHistory, entities: state.entities};
};
