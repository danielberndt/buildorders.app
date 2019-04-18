export type Res = {food: number; wood: number; gold: number; stone: number};

export type gatherTypes = "forage" | "sheep" | "hunt" | "fish" | "farm" | "wood" | "gold" | "stone";

export type taskTypes = "build" | "gather" | "lure";

type ResPatchWithCount = {
  type: "berries" | "sheep" | "deer" | "stragglers";
  count: number;
  distance: number;
};
type ResPatchWithoutCount = {
  type: "boar" | "wood" | "gold" | "stone";
  distance: number;
};
type EnhancedResPatch = {
  resType: keyof Res;
  remaining: number;
};
export type ResPatch = ResPatchWithCount | ResPatchWithoutCount;

export type ResPatches = {[id: string]: ResPatch};
export type EnhancedResPatches = {[id: string]: EnhancedResPatch & ResPatch};
