import React from "react";
import css from "@emotion/css";
import {Col, Row} from "../../../style/layout";
import {Text} from "../../../style/text";
import EntityCol, {TechCol} from "./EntityCol";

const popOuterStyle = css({
  position: "sticky",
  top: "2rem",
});
const popInnerStyle = css({
  position: "absolute",
  top: 0,
  right: 0,
});

const PopIndicator = ({pop, isOdd}) => (
  <div css={popOuterStyle}>
    <Row css={popInnerStyle} px={1} py={0}>
      <Text size="xxs" weight="bold" color={isOdd ? "gray_600" : "gray_700"}>
        {pop}
      </Text>
    </Row>
  </div>
);

const colStyle = css({flex: "1rem 1 1", maxWidth: "1rem"});

const PopGroup = ({
  group,
  pixelsPerSecond,
  totalDuration,
  isOdd,
  isLast,
  pop,
  showTechSteps,
  bufferFromStart,
}) => (
  <div css={{position: "relative"}}>
    {!isLast && <PopIndicator pop={pop + 5} isOdd={isOdd} />}
    <Row sp={0} px={0} bg={isOdd ? "transparent" : "gray_800"}>
      {showTechSteps && (
        <Col css={colStyle}>
          <div css={{height: bufferFromStart}} />
          <TechCol techSteps={showTechSteps} pixelsPerSecond={pixelsPerSecond} />
        </Col>
      )}
      {group
        .filter((entity) => entity.steps.some((s) => s.desc.type !== "wait"))
        .map((entity) => (
          <Col key={entity.id} css={colStyle}>
            <div css={{height: bufferFromStart}} />
            <EntityCol
              entity={entity}
              pixelsPerSecond={pixelsPerSecond}
              totalDuration={totalDuration}
            />
          </Col>
        ))}
    </Row>
  </div>
);

const getPopGroups = (entities) => {
  let currPopGroupCount = 0;
  let currPopGroup = [];
  const popGroups = [];
  entities.forEach((ent) => {
    currPopGroup.push(ent);
    if (ent.category === "unit") currPopGroupCount += 1;
    if (currPopGroupCount === 5) {
      popGroups.push(currPopGroup);
      currPopGroup = [];
      currPopGroupCount = 0;
    }
  });
  if (currPopGroup.length) popGroups.push(currPopGroup);
  return popGroups;
};

const DetailView = React.memo(({entities, pixelsPerSecond, totalDuration, bufferFromStart}) => {
  const techSteps = [];
  const restList = [];
  // Don't show a full column for each building which only does research. Instead create
  // a TechCol which lists all research
  // TODO: Add TechCol to own pop column
  Object.values(entities).forEach((ent) => {
    const onlyTechResearch =
      ent.steps.some((s) => s.desc.type === "research") &&
      ent.steps.every((s) => s.desc.type === "research" || s.desc.type === "wait");
    if (onlyTechResearch) {
      ent.steps.forEach((step, i) => {
        if (step.desc.type === "research") {
          const duration =
            (i + 1 < ent.steps.length ? ent.steps[i + 1].start : totalDuration) - step.start;
          techSteps.push({...step, duration});
        }
      });
    } else {
      restList.push(ent);
    }
  });
  const popGroups = getPopGroups(restList);

  return popGroups.map((group, i) => (
    <PopGroup
      key={i}
      isLast={i === popGroups.length - 1}
      isOdd={i % 2 === 1}
      pop={i * 5}
      group={group}
      pixelsPerSecond={pixelsPerSecond}
      totalDuration={totalDuration}
      showTechSteps={i === 0 && techSteps.length && techSteps}
      bufferFromStart={bufferFromStart}
    />
  ));
});

export default DetailView;
