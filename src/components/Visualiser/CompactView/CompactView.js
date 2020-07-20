import React from "react";
import {Col} from "../../../style/layout";
import {ColTop} from "../shared";

const BuildingLane = ({building, pixelsPerSecond, bufferFromStart, entities}) => {
  const {type, createdAt, id, steps} = building;
  return (
    <React.Fragment>
      <Col>
        <div css={{height: bufferFromStart + createdAt * pixelsPerSecond}} />
        <Col fillParent bg="gray_400" css={{position: "relative", maxWidth: "1rem"}}>
          <ColTop type={type} id={id} />
          <div>hi</div>
        </Col>
      </Col>
    </React.Fragment>
  );
};

const CompactView = React.memo(({entities, pixelsPerSecond, totalDuration, bufferFromStart}) => {
  const researches = [];
  const buildingsTrainingUnits = Object.values(entities).filter((ent) => {
    if (ent.category !== "building") return false;
    const trainUnits = ent.steps.some((s) => s.desc.type === "train");
    if (!trainUnits) {
      researches.push(...ent.steps.filter((s) => s.desc.type === "research"));
    }
    return trainUnits;
  });

  console.log({buildingsTrainingUnits, researches, bufferFromStart});
  return buildingsTrainingUnits.map((b) => (
    <BuildingLane
      key={b.id}
      building={b}
      pixelsPerSecond={pixelsPerSecond}
      bufferFromStart={bufferFromStart}
      entities={entities}
    />
  ));
});

export default CompactView;
