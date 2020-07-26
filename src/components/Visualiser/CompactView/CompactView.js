import React from "react";
import {create} from "zustand";
import {Col, Row} from "../../../style/layout";
import {ColTop, resTypeInfo, getIcon} from "../shared";
import {css} from "@emotion/core";
import {colors} from "../../../style/tokens";
import {useMeasure} from "../../../hooks/useMeasure";

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
  berries: "food",
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
      start: currentStart !== null ? currentStart : step.start,
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

const activitesToLanes = ({activities, iconHeightInPixels, entities}) => {
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
  allActivites.forEach((a) => {
    if (a.entityIds.length === 1) {
      const ent = entities[a.entityIds[0]];
      if (ent.createdAt > 0 && a.start - ent.createdAt < 90) {
        a.connectToEntId = ent.id;
      }
    }
  });
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

const withoutEl = (obj, removeKey) => {
  const newObj = {...obj};
  delete newObj[removeKey];
  return newObj;
};

const [useEntityPositionStore] = create((set) => ({
  entPositions: {},
  connections: {},
  setEntPosition: (entId, pos) =>
    set((state) => ({entPositions: {...state.entPositions, [entId]: pos}})),
  removeEntity: (entId) => set((state) => ({entPositions: withoutEl(state.entPositions, entId)})),
  setConnection: (entId, entPos, targetPos) =>
    set((state) => ({connections: {...state.connections, [entId]: {entPos, targetPos}}})),
  removeConnection: (entId) => set((state) => ({connections: withoutEl(state.connections, entId)})),
}));

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

const connectionsStyle = css({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

const ConnectionLine = ({entPos, targetPos, bounds}) => {
  const centerEnt = [entPos.left + entPos.width / 2, entPos.top + entPos.height / 2];
  const centerTarget = [targetPos.left + targetPos.width / 2, targetPos.top + targetPos.height / 2];
  return (
    <svg
      preserveAspectRatio="none"
      style={{
        display: "block",
        position: "absolute",
        width: centerTarget[0] - centerEnt[0],
        left: centerEnt[0] - bounds.left,
        top: centerEnt[1] - bounds.top,
        height: centerTarget[1] - centerEnt[1],
      }}
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
    >
      <line x1="0" y1="0" x2="100" y2="100" stroke={colors.gray_500} />
    </svg>
  );
};

const Connections = () => {
  const connections = useEntityPositionStore((s) => s.connections);
  const [bounds, ref] = useMeasure();
  return (
    <div css={connectionsStyle} ref={ref}>
      {bounds &&
        Object.entries(connections).map(([key, {entPos, targetPos}]) => (
          <ConnectionLine key={key} entPos={entPos} targetPos={targetPos} bounds={bounds} />
        ))}
    </div>
  );
};

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
      return {icon: getIcon(desc.building, desc.id), title: desc.building, color: "teal_300"};
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

const StepIcon = React.forwardRef(({stepDesc}, ref) => {
  const {icon, color, title} = getStepInfo(stepDesc);
  return (
    <img
      ref={ref}
      src={icon}
      alt={title}
      title={title}
      css={iconStyle}
      style={{borderColor: colors[color]}}
    />
  );
});

const UnitIcon = React.forwardRef(({unit}, ref) => (
  <img
    src={getIcon(unit.type, unit.id)}
    alt={unit.type}
    title={unit.type}
    css={iconStyle}
    ref={ref}
  />
));

const UnitStep = ({entity, start, createdAt, buildingCreatedAt, firstStep, pixelsPerSecond}) => {
  const {setEntPosition, removeEntity} = useEntityPositionStore((s) => ({
    setEntPosition: s.setEntPosition,
    removeEntity: s.removeEntity,
  }));
  const [position, ref] = useMeasure();
  React.useEffect(() => {
    if (position) setEntPosition(entity.id, position);
  }, [entity.id, position, setEntPosition]);
  React.useEffect(() => {
    return () => removeEntity(entity.id);
  }, [entity.id, removeEntity]);
  return (
    <Col
      css={entityTile}
      style={{
        top: (start - buildingCreatedAt) * pixelsPerSecond,
        height: (createdAt - start) * pixelsPerSecond,
      }}
    >
      <div css={unitLineStyle} />
      {firstStep ? (
        <StepIcon stepDesc={firstStep.desc} ref={ref} />
      ) : (
        <UnitIcon unit={entity} ref={ref} />
      )}
    </Col>
  );
};

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

const Connector = ({connectToEntId}) => {
  const entPos = useEntityPositionStore((s) => s.entPositions[connectToEntId]);
  const [bounds, ref] = useMeasure();
  const {setConnection, removeConnection} = useEntityPositionStore((s) => ({
    setConnection: s.setConnection,
    removeConnection: s.removeConnection,
  }));
  React.useEffect(() => {
    if (entPos && bounds) {
      setConnection(connectToEntId, entPos, bounds);
      return () => removeConnection(connectToEntId);
    }
  }, [bounds, connectToEntId, entPos, removeConnection, setConnection]);
  return (
    <div
      style={{position: "absolute", top: 0, left: 0, bottom: 0, right: 0, zIndex: -2}}
      ref={ref}
    />
  );
};

const Activity = ({desc, entityIds, start, pixelsPerSecond, connectToEntId}) => {
  return (
    <Col css={entityTile} style={{top: start * pixelsPerSecond}}>
      {connectToEntId && <Connector connectToEntId={connectToEntId} />}
      {desc.type !== "research" && <div css={villCountPill}>{entityIds.length}</div>}
      <StepIcon stepDesc={desc} />
    </Col>
  );
};

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
  const activityLanes = activitesToLanes({activities, iconHeightInPixels: 15, entities});

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

  return (
    <Row sp={1} css={{positon: "relative"}}>
      <Connections />
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
