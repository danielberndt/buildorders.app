import React from "react";
import {Col, Row} from "../../../style/layout";
import {ColTop, resTypeInfo, getIcon} from "../shared";
import {css} from "@emotion/core";
import {colors} from "../../../style/tokens";

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
  let currStep = null;
  steps.forEach((step) => {
    if (step.desc.type === "wait") return;
    if (step.desc.type === "walk" && !step.desc.luringBoarId) {
      currentStart = step.start;
      return;
    }
    if (step.desc.type === "gather") {
      if (skipGatheringOfType && skipGatheringOfType === step.desc.resType) return;
      if (skipGatheringOfCategory && skipGatheringOfCategory === resTypeToCat[step.desc.resType])
        return;
    }
    if (currStep && currStep.desc.type === "gather" && currStep.desc.resType === "stragglers") {
      if (step.desc.type === "build" && step.desc.building === "farm") {
        currStep.desc = {...currStep.desc, stragglerToFarm: true};
        skipGatheringOfType = "farm";
        return;
      }
    }
    currStep = {
      start: currentStart || step.start,
      actionStart: step.start,
      desc: step.desc,
    };
    compactSteps.push(currStep);
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
      return `gather-${step.desc.resId}${step.desc.stragglerToFarm ? "-to-farm" : ""}`;
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
        return a.start > step.start - 15 && a.start < step.start + 15;
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
        id: s.desc.id,
      });
    }
  });

  return buildingLane;
};

const activitesToLanes = ({activities, iconHeightInPixels}) => {
  const allActivites = [];
  Object.entries(activities).forEach(([key, instances]) => {
    instances.forEach((val) => {
      allActivites.push({
        key: `${key}-${val.start}`,
        ...val,
      });
    });
  });
  if (!allActivites.length) return [];
  allActivites.sort((a1, a2) => a1.start - a2.start);
  const first = allActivites[0];
  const lanes = [{activities: [first], busyTill: first.start + iconHeightInPixels}];
  allActivites.slice(1).forEach((a) => {
    const freeLane = lanes.find((l) => l.busyTill < a.start);
    if (freeLane) {
      freeLane.activities.push(a);
      freeLane.busyTill = a.start + iconHeightInPixels;
    } else {
      lanes.push({activities: [a], busyTill: a.start + iconHeightInPixels});
    }
  });
  return lanes.map((l) => l.activities);
};

const entityTile = css({
  position: "absolute",
  left: 0,
  right: 0,
});

const unitLineStyle = css({
  position: "relative",
  flex: "auto",
  alignSelf: "center",
  width: 1,
  background: colors.gray_500,
});

const unitLineStyleTop = [
  unitLineStyle,
  css({
    "::before": {
      content: "''",
      position: "absolute",
      top: 0,
      left: "-0.3rem",
      right: "-0.3rem",
      height: 1,
      backgroundColor: colors.orange_300,
    },
  }),
];
const unitLineStyleBottom = [
  unitLineStyle,
  css({
    "::before": {
      content: "''",
      position: "absolute",
      bottom: 0,
      left: "-0.3rem",
      right: "-0.3rem",
      height: 1,
      backgroundColor: colors.orange_300,
    },
  }),
];

const iconStyle = css({
  display: "block",
  width: "1.25rem",
  height: "1.25rem",
  borderRadius: "25%",
  border: `2px solid ${colors.gray_500}`,
});

const villCountPill = css({
  position: "absolute",
  top: "-0.375rem",
  right: "-0.375rem",
  width: "0.75rem",
  height: "0.75rem",
  borderRadius: "50%",
  backgroundColor: colors.gray_800,
  color: colors.gray_300,
  fontSize: `${10 / 16}rem`,
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const getStepInfo = (desc) => {
  switch (desc.type) {
    case "gather":
      if (desc.stragglerToFarm) {
        return {
          ...resTypeInfo[desc.resType],
          icon: require("../../../images/ressources/straggler-to-farm.png"),
          title: "straggler until farm",
        };
      } else {
        return {...resTypeInfo[desc.resType], title: desc.resType};
      }
    case "build":
      return {icon: getIcon(desc.building, desc.id), color: "teal_300"};
    case "kill":
      return {...resTypeInfo.boar, title: "attack boar"};
    case "walk":
      return {...resTypeInfo.boar, title: "lure boar"};
    case "research":
      return {icon: getIcon(desc.technology, desc.id), color: "orange_300"};
    default:
      throw new Error(`Dunno step type ${desc.type}`);
  }
};

const StepIcon = ({stepDesc}) => {
  const {icon, color, title} = getStepInfo(stepDesc);
  return (
    <img
      src={icon}
      alt={title}
      title={title}
      css={iconStyle}
      style={{borderColor: colors[color]}}
    />
  );
};

const UnitIcon = ({unit}) => (
  <img src={getIcon(unit.type, unit.id)} alt={unit.type} title={unit.type} css={iconStyle} />
);

const UnitStep = ({entity, start, createdAt, buildingCreatedAt, firstStep, pixelsPerSecond}) => (
  <Col
    css={entityTile}
    style={{
      top: (start - buildingCreatedAt) * pixelsPerSecond,
      height: (createdAt - start) * pixelsPerSecond,
    }}
  >
    <div css={unitLineStyle} />
    {firstStep ? <StepIcon stepDesc={firstStep.desc} /> : <UnitIcon unit={entity} />}
  </Col>
);

const ResearchStep = ({start, buildingCreatedAt, technology, id, duration, pixelsPerSecond}) => (
  <Col
    css={entityTile}
    style={{
      top: (start - buildingCreatedAt) * pixelsPerSecond,
      height: duration * pixelsPerSecond,
    }}
  >
    <div css={unitLineStyleTop} style={{backgroundColor: colors.orange_300}} />
    <img
      src={getIcon(technology, id)}
      alt={technology}
      title={technology}
      css={iconStyle}
      style={{borderColor: colors.orange_300}}
    />
    <div css={unitLineStyleBottom} style={{backgroundColor: colors.orange_300}} />
  </Col>
);

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

const Activity = ({desc, entityIds, start, pixelsPerSecond}) => (
  <Col css={entityTile} style={{top: start * pixelsPerSecond}}>
    {desc.type !== "research" && <div css={villCountPill}>{entityIds.length}</div>}
    <StepIcon stepDesc={desc} />
  </Col>
);

const ActivityLane = ({activities, pixelsPerSecond, bufferFromStart}) => {
  return (
    <Col css={{width: "1.25rem"}}>
      <div css={{height: bufferFromStart}} />
      <Col style={{position: "relative"}}>
        {activities.map(({key, ...rest}) => (
          <Activity key={key} {...rest} pixelsPerSecond={pixelsPerSecond} />
        ))}
      </Col>
    </Col>
  );
};

const BuildingLane = ({building, pixelsPerSecond, bufferFromStart, entities, activities}) => {
  const {type, createdAt, id, steps} = building;
  const buildingSteps = getBuildingSteps({steps, entities, activities});
  const activityLanes = activitesToLanes({activities, iconHeightInPixels: 15});

  return (
    <React.Fragment>
      {buildingSteps.length > 0 && (
        <Col css={{width: "1.25rem"}}>
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
      {activityLanes.length > 0 &&
        activityLanes.map((activities, i) => (
          <ActivityLane
            key={i}
            activities={activities}
            pixelsPerSecond={pixelsPerSecond}
            bufferFromStart={bufferFromStart}
          />
        ))}
    </React.Fragment>
  );
};

const CompactView = React.memo(({entities, pixelsPerSecond, totalDuration, bufferFromStart}) => {
  const startUnitActivities = {};
  const entityList = Object.values(entities);
  const buildingsTrainingUnits = entityList.filter((ent) => {
    if (ent.category !== "building") return false;
    const trainUnits = ent.steps.some((s) => s.desc.type === "train");
    if (!trainUnits) {
      ent.steps
        .filter((s) => s.desc.type === "research")
        .forEach((s) => {
          startUnitActivities[`research-${s.desc.technology}-${s.desc.id}`] = [
            {start: s.start, desc: s.desc, entityIds: [ent.id]},
          ];
        });
    }
    return trainUnits;
  });

  const startUnits = entityList.filter((ent) => ent.category === "unit" && ent.createdAt === 0);
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

  return (
    <Row sp={1}>
      {buildingsTrainingUnits.map((b, i) => (
        <BuildingLane
          key={b.id}
          activities={
            !firstTc
              ? i === 0
                ? startUnitActivities
                : {}
              : b === firstTc
              ? startUnitActivities
              : {}
          }
          building={b}
          pixelsPerSecond={pixelsPerSecond}
          bufferFromStart={bufferFromStart}
          entities={entities}
        />
      ))}
    </Row>
  );
});

export default CompactView;
