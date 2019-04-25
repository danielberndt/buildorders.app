import {buildings, units, technologies} from "./entities";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
export type FindByType<ObjWithType, Type> = ObjWithType extends {type: Type} ? ObjWithType : never;

export type Res = {food: number; wood: number; gold: number; stone: number};

type ResPatchWithCount = {
  type: "berries" | "sheep" | "deer" | "stragglers";
  count: number;
  distance: number;
};
type ResPatchWithoutCount = {
  type: "boar" | "wood" | "gold" | "stone" | "farm";
  distance: number;
};

export type Buildings = keyof typeof buildings;
export type Units = keyof typeof units;
export type Technologies = keyof typeof technologies;

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
  hasDeposit: boolean;
  hpRemaining: number;
};
export type ResPatch = ResPatchWithCount | ResPatchWithoutCount;

export type ResPatches = {[id: string]: ResPatch};
export type EnhancedResPatches = {[id: string]: EnhancedResPatch & ResPatch};

export type Until =
  | {type: "buildRes"; entity: Buildings | Units | Technologies}
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

type RawStepDesc =
  | {type: "gather"; resId: string; resType: string; activity: GatherTypes}
  | {type: "build"; building: Buildings; isDepositAtRes: string | null; id: string}
  | {type: "walk"; endLocation: number; remainingDistance: number} & (
      | {luringBoarId: string}
      | {targetTask: Task; targetRes: string | null})
  | {type: "wait"}
  | {type: "train"; unit: Units; id: string; remainingTime: number}
  | {type: "research"; technology: Technologies; remainingTime: number}
  | {type: "kill"; targetTask: Task; boarId: string};

export type StepDesc = RawStepDesc & {
  until: Until[];
};
export type StepTypes = PropType<StepDesc, "type">;

export type Step = {
  desc: StepDesc;
  entity: Entity;
  start: number;
};

export type Entity = {
  id: string;
  type: Units | Buildings;
  createdAt: number;
  steps: Step[];
  remainingTasks: Task[];
  distanceFromTC: number | null;
  atTaskLocation: Task | null;
  atRes: string | null;
};

export type Instructions = {
  startingRes: Res;
  resPatches: ResPatches;
  entities: {[id: string]: {type: Units | Buildings}};
  tasks: {[id: string]: Task[]};
};

export type Construction = {
  builders: number;
  timeLeft: number;
  building: Buildings;
  isDepositAtRes: string | null;
  distance: number;
};
export type Constructions = {[id: string]: Construction};
