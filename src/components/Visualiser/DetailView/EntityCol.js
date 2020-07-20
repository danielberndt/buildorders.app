import React from "react";
import {ressources} from "../../../simulator/entities";
import css from "@emotion/css";
import {Col, Row} from "../../../style/layout";
import {getIcon, ColTop} from "../shared";

const iconStyle = css({
  display: "block",
  width: "100%",
  height: "auto",
  position: "sticky",
  top: "2.8rem",
});

const TrainStep = ({height, desc}) => (
  <Col css={{height, position: "relative"}} bg="blue_200">
    <img src={getIcon(desc.unit, desc.id)} alt={desc.unit} title={desc.unit} css={iconStyle} />
  </Col>
);

const ResearchStep = ({height, desc: {technology, id}}) => (
  <Col css={{height, position: "relative"}} bg="purple_200">
    <img src={getIcon(technology, id)} alt={technology} title={technology} css={iconStyle} />
  </Col>
);

const BuildStep = ({height, desc: {building, id}}) => (
  <Col css={{height, position: "relative"}} bg="indigo_200">
    <img src={getIcon(building, id)} alt={building} title={building} css={iconStyle} />
  </Col>
);

const WalkStep = ({height, desc: {luringBoarId}}) => (
  <Col css={{height, position: "relative"}} bg="gray_500">
    {luringBoarId && (
      <img src={ressources.boar.icon} alt="Luring boar" title="Luring boar" css={iconStyle} />
    )}
  </Col>
);

const WaitStep = ({height}) => <Col css={{height, position: "relative"}} bg="gray_600" />;
const KillStep = ({height}) => <Col css={{height, position: "relative"}} bg="gray_500" />;

const resTypeInfo = {
  berries: {icon: ressources.berries.icon, color: "red_300"},
  sheep: {icon: ressources.sheep.icon, color: "red_200"},
  deer: {icon: ressources.deer.icon, color: "red_500"},
  // TODO: find straggler icon
  stragglers: {icon: ressources.wood.icon, color: "green_200"},
  boar: {icon: ressources.boar.icon, color: "purple_300"},
  wood: {icon: ressources.wood.icon, color: "green_400"},
  gold: {icon: ressources.gold.icon, color: "red_300"},
  stone: {icon: ressources.stone.icon, color: "red_300"},
  farm: {icon: ressources.farm.icon, color: "orange_300"},
};

const GatherStep = ({height, desc: {resType, activity}}) => {
  const info = resTypeInfo[resType];
  return (
    <Col css={{height, position: "relative"}} bg={info.color}>
      <img src={info.icon} alt={resType} title={resType} css={iconStyle} />
    </Col>
  );
};

const stepComps = {
  train: TrainStep,
  research: ResearchStep,
  build: BuildStep,
  walk: WalkStep,
  wait: WaitStep,
  gather: GatherStep,
  kill: KillStep,
};

const Step = ({step, duration, pixelsPerSecond}) => {
  const {desc} = step;
  const height = duration * pixelsPerSecond;
  const StepComp = stepComps[desc.type];
  return <StepComp height={height} desc={desc} />;
};

const EntityCol = ({entity, pixelsPerSecond, totalDuration}) => {
  const {type, createdAt, id, steps} = entity;
  return (
    <React.Fragment>
      {createdAt > 0 && <div css={{height: createdAt * pixelsPerSecond}} />}
      <Col fillParent bg="gray_400" css={{position: "relative"}}>
        <ColTop type={type} id={id} />
        {steps.map((step, i) => {
          const duration = (i + 1 < steps.length ? steps[i + 1].start : totalDuration) - step.start;
          return <Step key={i} step={step} pixelsPerSecond={pixelsPerSecond} duration={duration} />;
        })}
      </Col>
    </React.Fragment>
  );
};

export default EntityCol;

const clumpStyle = css({
  position: "absolute",
  left: 0,
  right: 0,
});

const clumpImgStyle = css({
  height: "auto",
  display: "block",
});

const TechClump = ({clump, pixelsPerSecond}) => (
  <Row css={clumpStyle} style={{top: clump.start * pixelsPerSecond}}>
    {clump.steps.map((step) => (
      <Col
        key={step.desc.technology}
        css={{overflow: "hidden"}}
        bg="purple_200"
        style={{
          height: step.duration * pixelsPerSecond,
          marginTop: (step.start - clump.start) * pixelsPerSecond,
        }}
      >
        <img
          src={getIcon(step.desc.technology, "")}
          alt={step.desc.technology}
          title={step.desc.technology}
          css={clumpImgStyle}
          style={{width: `${100 * clump.steps.length}%`}}
        />
      </Col>
    ))}
  </Row>
);

const findClumps = (techSteps) => {
  const clumps = [];
  let currentClump = null;
  let currentClumpDone = 0;
  techSteps.sort((s1, s2) => s1.start - s2.start);
  for (let step of techSteps) {
    if (step.start > currentClumpDone) {
      currentClump = {start: step.start, steps: [step]};
      clumps.push(currentClump);
      currentClumpDone = step.start + step.duration;
    } else {
      currentClump.steps.push(step);
      currentClumpDone = Math.max(step.start + step.duration, currentClumpDone);
    }
  }
  return clumps;
};

export const TechCol = ({techSteps, pixelsPerSecond}) => (
  <Col fillParent bg="gray_600" css={{position: "relative"}}>
    {findClumps(techSteps).map((c, i) => (
      <TechClump key={i} clump={c} pixelsPerSecond={pixelsPerSecond} />
    ))}
  </Col>
);
