import React from "react";
import {allEntities, ressources} from "../../simulator/entities";
import css from "@emotion/css";
import {Col} from "../../style/layout";

const hashToInt = val => {
  let hash = 0;
  if (val.length === 0) return hash;
  for (let i = 0; i < val.length; i++) {
    let chr = val.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

const getIcon = (entity, id) => {
  const {icon: rawIcon} = allEntities[entity];
  return Array.isArray(rawIcon) ? rawIcon[hashToInt(id) % rawIcon.length] : rawIcon;
};

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

const topStyle = css({position: "sticky", top: "2.8rem", zIndex: 1});
const topInnerStyle = css({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
});
const topIconStyle = css({display: "block", width: "100%"});

const Top = ({type, id}) => (
  <div css={topStyle}>
    <div css={topInnerStyle}>
      <img src={getIcon(type, id)} alt={type} title={type} css={topIconStyle} />
    </div>
  </div>
);

const colStyle = css({position: "relative", flex: "1rem 1 1", maxWidth: "1rem"});

const EntityCol = ({entity, pixelsPerSecond, totalDuration}) => {
  const {type, createdAt, id, steps} = entity;
  return (
    <Col>
      {createdAt > 0 && <div css={{height: createdAt * pixelsPerSecond}} />}
      <Col fillParent bg="gray_400" css={colStyle}>
        <Top type={type} id={id} />
        {steps.map((step, i) => {
          const duration = (i + 1 < steps.length ? steps[i + 1].start : totalDuration) - step.start;
          return <Step key={i} step={step} pixelsPerSecond={pixelsPerSecond} duration={duration} />;
        })}
      </Col>
    </Col>
  );
};

export default EntityCol;
