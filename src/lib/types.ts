import {Buildings, Units, Technologies} from "./entities";

export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export type Res = {food: number; wood: number; gold: number; stone: number};

type ResPatchWithCount = {
  type: "berries" | "sheep" | "deer" | "stragglers";
  count: number;
  distance: number;
};
type ResPatchWithoutCount = {
  type: "boar" | "wood" | "gold" | "stone";
  distance: number;
};

export type GatherTypes =
  | "foraging"
  | "eatingSheep"
  | "hunting"
  | "fishing"
  | "farming"
  | "cuttingWood"
  | "miningGold"
  | "miningStone";

export type EnhancedResPatch = {
  resType: keyof Res;
  remaining: number;
};
export type ResPatch = ResPatchWithCount | ResPatchWithoutCount;

export type ResPatches = {[id: string]: ResPatch};
export type EnhancedResPatches = {[id: string]: EnhancedResPatch & ResPatch};

export type Until =
  | {type: "buildRes"; building: Buildings}
  | {type: "event"; name: string}
  | {type: "atTarget"};

export type RawTasks =
  | {type: "gather"; resId: string}
  | ({type: "build"; building: Buildings; id?: string} & ({distance: number} | {atRes: string}))
  | {type: "train"; unit: Units; id?: string}
  | {type: "research"; technology: Technologies}
  | {type: "lure"; boarId: string}
  | {type: "wait"};

export type TaskType = PropType<RawTasks, "type">;

export type Task = RawTasks & {
  until?: Until;
};

type RawStepDescs = {type: "gather"};
export type StepTypes = PropType<RawStepDescs, "type">;

export type Step = {
  desc: RawStepDescs & {
    until: Until[];
  };
  entity: Entity;
  start: number;
};

export type Entity = {
  type: Units | Buildings;
  createdAt: number;
  steps: Step[];
  remainingTasks: Task[];
  distanceFromTC: number | null;
};

export type Instructions = {
  startingRes: Res;
  resPatches: ResPatches;
  entities: {[id: string]: {type: Units | Buildings}};
  tasks: {[id: string]: Task[]};
};
