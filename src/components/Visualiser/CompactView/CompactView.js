import React from "react";
import {Col} from "../../../style/layout";
import {ColTop} from "../shared";

const buildingToResCategory = {
  mill: "food",
  lumberCamp: "wood",
  miningCamp: "mineral",
};

const resTypeToCat = {
  stragglers: "wood",
  wood: "wood",
  kill: "food",
  sheep: "food",
  boar: "food",
  farm: "food",
  deer: "food",
  gold: "mineral",
  stone: "mineral",
};

const compactUnitSteps = (steps) => {
  const compactSteps = [];
  let currentStart = null;
  let skipGatheringOfCategory = null;
  let skipGatheringOfType = null;
  steps.forEach((step) => {
    if (step.desc.type === "wait") return;
    if (step.desc.type === "walk") {
      currentStart = step.start;
      return;
    }
    if (step.desc.type === "gather") {
      if (skipGatheringOfType && skipGatheringOfType === step.desc.resType) return;
      if (skipGatheringOfCategory && skipGatheringOfCategory === resTypeToCat[step.desc.resType])
        return;
    }
    compactSteps.push({
      start: currentStart || step.start,
      actionStart: step.start,
      desc: step.desc,
    });
    currentStart = null;
    if (step.desc.type === "build") {
      if (step.desc.building === "farm") {
        skipGatheringOfType = "farm";
      } else {
        skipGatheringOfCategory = buildingToResCategory[step.desc.building] || null;
      }
    } else if (step.desc.type === "kill") {
      skipGatheringOfType = "boar";
    } else {
      skipGatheringOfType = null;
      skipGatheringOfCategory = null;
    }
  });
  return compactSteps;
};

const getActivityKey = (step) => {
  switch (step.desc.type) {
    case "build":
      if (step.desc.building !== "farm") {
        return `build-${step.desc.id}`;
      } else {
        return `build-${step.desc.building}`;
      }
    case "gather":
      return `gather-${step.desc.resId}`;
    case "kill":
      return `kill-${step.desc.boarId}`;
    default:
      debugger;
      throw new Error("Dunno step type" + step.desc.type);
  }
};

const populateActivities = ({activities, compactSteps, entityId}) => {
  compactSteps.forEach((step) => {
    const actKey = getActivityKey(step);
    const existingActs = activities[actKey];
    if (!existingActs) {
      activities[actKey] = [{start: step.start, desc: step.desc, entityIds: [entityId]}];
    } else {
      const closeAct = existingActs.find((a) => {
        if (step.desc.type === "build" && step.desc.building !== "farm") {
          // always group building the *same* building
          return true;
        }
        return a.start > step.start - 10 && a.start < step.start + 10;
      });
      if (closeAct) {
        closeAct.entityIds.push(entityId);
      } else {
        existingActs.push({start: step.start, desc: step.desc, entityIds: [entityId]});
      }
    }
  });
};

const getBuildingSteps = ({steps, entities, activities}) => {
  const buildingLane = [];

  steps.forEach((s) => {
    if (s.desc.type === "train") {
      const entity = entities[s.desc.id];
      if (!entity) {
        console.warn(`couldn't find trained entity ${s.desc.id}`);
        return;
      }
      const compactSteps = compactUnitSteps(entity.steps);
      buildingLane.push({
        type: "unit",
        entity,
        start: s.start,
        createdAt: entity.createdAt,
        firstStep: compactSteps[0] || null,
      });
      if (compactSteps.length > 1) {
        populateActivities({
          activities,
          compactSteps: compactSteps.slice(1),
          entityId: entity.id,
        });
      }
    } else if (s.desc.type === "research") {
      buildingLane.push({
        type: "research",
        start: s.start,
        technology: s.desc.technology,
        duration: s.desc.startTime,
      });
    }
  });

  return buildingLane;
};

const UnitStep = ({entity, start, createdAt, buildingCreatedAt, firstStep, pixelsPerSecond}) => (
  <div
    style={{
      position: "absolute",
      top: (start - buildingCreatedAt) * pixelsPerSecond,
      left: 0,
      right: 0,
      height: (createdAt - start) * pixelsPerSecond,
    }}
  >
    {entity.type}
  </div>
);

const ResearchStep = ({start, buildingCreatedAt, technology, duration, pixelsPerSecond}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: (start - buildingCreatedAt) * pixelsPerSecond,
        left: 0,
        right: 0,
        height: duration * pixelsPerSecond,
      }}
    >
      {technology}
    </div>
  );
};

const BuildingSteps = ({steps, startAt, pixelsPerSecond}) =>
  steps.map(({type, ...rest}) =>
    type === "unit" ? (
      <UnitStep
        key={rest.entity.id}
        buildingCreatedAt={startAt}
        {...rest}
        pixelsPerSecond={pixelsPerSecond}
      />
    ) : (
      <ResearchStep
        key={rest.technology}
        buildingCreatedAt={startAt}
        {...rest}
        pixelsPerSecond={pixelsPerSecond}
      />
    )
  );
const BuildingLane = ({building, pixelsPerSecond, bufferFromStart, entities, activities}) => {
  const {type, createdAt, id, steps} = building;
  const buildingSteps = getBuildingSteps({steps, entities, activities});
  const activityList = Object.values(activities);

  console.log({buildingSteps});

  return (
    <React.Fragment>
      {buildingSteps && (
        <Col css={{width: "100%", maxWidth: "1rem"}}>
          <div css={{height: bufferFromStart + createdAt * pixelsPerSecond}} />
          <Col fillParent css={{position: "relative"}}>
            <ColTop type={type} id={id} />
            <BuildingSteps
              steps={buildingSteps}
              startAt={createdAt}
              pixelsPerSecond={pixelsPerSecond}
            />
          </Col>
        </Col>
      )}
    </React.Fragment>
  );
};

const CompactView = React.memo(({entities, pixelsPerSecond, totalDuration, bufferFromStart}) => {
  const researches = [];
  const entityList = Object.values(entities);
  const buildingsTrainingUnits = entityList.filter((ent) => {
    if (ent.category !== "building") return false;
    const trainUnits = ent.steps.some((s) => s.desc.type === "train");
    if (!trainUnits) {
      researches.push(...ent.steps.filter((s) => s.desc.type === "research"));
    }
    return trainUnits;
  });

  const startUnits = entityList.filter((ent) => ent.category === "unit" && ent.createdAt === 0);
  const startUnitActivities = {};
  startUnits.forEach((entity) => {
    const compactSteps = compactUnitSteps(entity.steps);
    if (!compactSteps.length) return;
    populateActivities({
      activities: startUnitActivities,
      compactSteps: compactSteps,
      entityId: entity.id,
    });
  });
  const firstTc = entityList.find((ent) => ent.type === "townCenter");

  console.log({entities});

  return buildingsTrainingUnits.map((b, i) => (
    <BuildingLane
      key={b.id}
      activities={
        !firstTc ? (i === 0 ? startUnitActivities : {}) : b === firstTc ? startUnitActivities : {}
      }
      building={b}
      pixelsPerSecond={pixelsPerSecond}
      bufferFromStart={bufferFromStart}
      entities={entities}
    />
  ));
});

export default CompactView;
