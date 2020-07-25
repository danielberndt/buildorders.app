import React from "react";
import css from "@emotion/css";
import {allEntities, ressources} from "../../simulator/entities";

const hashToInt = (val) => {
  let hash = 0;
  if (val.length === 0) return hash;
  for (let i = 0; i < val.length; i++) {
    let chr = val.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

export const getIcon = (entity, id) => {
  const {icon: rawIcon} = allEntities[entity];
  return Array.isArray(rawIcon) ? rawIcon[hashToInt(id) % rawIcon.length] : rawIcon;
};

const topStyle = css({position: "sticky", top: "2.8rem", zIndex: 1});
const topInnerStyle = css({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
});
const topIconStyle = css({display: "block", width: "100%"});

export const ColTop = ({type, id}) => (
  <div css={topStyle}>
    <div css={topInnerStyle}>
      <img src={getIcon(type, id)} alt={type} title={type} css={topIconStyle} />
    </div>
  </div>
);

export const resTypeInfo = {
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
