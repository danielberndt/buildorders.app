import React from "react";
import css from "@emotion/css";
import {createArrayWith} from "../../lib/range";
import {simulateGame} from "../../simulator";
import {Col, Row} from "../../style/layout";
import {formatTime} from "../../lib/format";
import {Text} from "../../style/text";
import {colors} from "../../style/tokens";
import Header from "./Header";
import EntityCol, {TechCol} from "./EntityCol";
import mq from "../../style/media-queries";

function getNodePosition(node) {
  if (!node) return null;
  return node.getBoundingClientRect().top;
}

export function useRelativePosition(nodeRef) {
  const [position, setNodePosition] = React.useState(null);
  React.useEffect(() => {
    setNodePosition(getNodePosition(nodeRef.current));
    let requestRunning = null;
    function handleScroll() {
      if (requestRunning === null) {
        requestRunning = window.requestAnimationFrame(() => {
          setNodePosition(getNodePosition(nodeRef.current));
          requestRunning = null;
        });
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [nodeRef]);
  return position;
}

const Timeline = ({totalSeconds, pixelsPerSecond}) => {
  const labels = createArrayWith(Math.ceil(totalSeconds / 30), i => i * 30);
  return (
    <Col css={{[mq.mobile]: {display: "none"}}}>
      <div css={{height: bufferFromStart}} />
      <div css={{position: "relative", height: totalSeconds * pixelsPerSecond, width: "2.5rem"}}>
        {labels.map(label => (
          <div key={label} css={{position: "absolute", top: label * pixelsPerSecond, left: 0}}>
            <Text size="xxs" lineHeight="none" color="gray_400" css={{marginTop: "-0.6em"}}>
              {formatTime(label)}
            </Text>
          </div>
        ))}
      </div>
    </Col>
  );
};

const bufferFromStart = 100;

const timeIndicatorContainerStyle = css({
  position: "sticky",
  top: bufferFromStart,
  zIndex: 2,
});

const timeIndicatorStyle = css({
  position: "absolute",
  top: 0,
  left: 0,
  width: ["96vw", "calc(100vw - 1rem)"],
  borderBottom: `1px solid ${colors.white_a10}`,
});

const timeIndicatorArrowStyle = css({
  position: "absolute",
  right: "100%",
  marginRight: "0.25rem",
  top: "-0.25rem",
  width: 0,
  height: 0,
  borderTop: "0.25rem solid transparent",
  borderBottom: "0.25rem solid transparent",
  borderLeft: `0.25rem solid ${colors.gray_500}`,
});

const TimeIndicator = () => (
  <div css={timeIndicatorContainerStyle}>
    <div css={timeIndicatorStyle}>
      <div css={timeIndicatorArrowStyle} />
    </div>
  </div>
);

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

const PopGroup = ({group, pixelsPerSecond, totalDuration, isOdd, isLast, pop, showTechSteps}) => (
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
        .filter(entity => entity.steps.some(s => s.desc.type !== "wait"))
        .map(entity => (
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

const getPopGroups = entities => {
  let currPopGroupCount = 0;
  let currPopGroup = [];
  const popGroups = [];
  entities.forEach(ent => {
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

const EntityList = React.memo(({entities, pixelsPerSecond, totalDuration}) => {
  const techSteps = [];
  const restList = [];
  // Don't show a full column for each building which only does research. Instead create
  // a TechCol which lists all research
  Object.values(entities).forEach(ent => {
    const onlyTechResearch =
      ent.steps.some(s => s.desc.type === "research") &&
      ent.steps.every(s => s.desc.type === "research" || s.desc.type === "wait");
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
    />
  ));
});
const Visualiser = ({instructions, duration: totalDuration, allAgeModifiers}) => {
  const containerRef = React.useRef();
  const scrollPos = useRelativePosition(containerRef);

  const {resAndPopHistory, entities} = React.useMemo(
    () => simulateGame(instructions, totalDuration, allAgeModifiers),
    [instructions, totalDuration, allAgeModifiers]
  );

  const pixelsPerSecond = 2;

  const currentTime =
    scrollPos === null
      ? 0
      : Math.min(
          totalDuration - 1,
          Math.max(0, Math.round((-scrollPos + bufferFromStart) / pixelsPerSecond))
        );

  const currentRes = resAndPopHistory[currentTime];

  return (
    <Col css={{position: "relative"}} bg="gray_700">
      <Header time={currentTime} res={currentRes} />
      <Col css={{position: "relative"}} px={1}>
        <Row>
          <Col>
            <div css={{height: bufferFromStart}} />
            <div css={{position: "relative", flex: "auto"}} ref={containerRef}>
              <TimeIndicator />
            </div>
          </Col>
          <Timeline totalSeconds={totalDuration - 1} pixelsPerSecond={pixelsPerSecond} />
          <EntityList
            entities={entities}
            totalDuration={totalDuration}
            pixelsPerSecond={pixelsPerSecond}
          />
        </Row>
      </Col>
      <div css={{height: "100vh"}} />
    </Col>
  );
};

export default Visualiser;
