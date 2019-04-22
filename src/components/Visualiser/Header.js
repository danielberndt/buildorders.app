import React from "react";
import {css} from "@emotion/core";
import {Row} from "../../style/layout";
import {Text} from "../../style/text";
import {formatTime} from "../../lib/format";

const resTypes = [
  {resName: "wood", icon: require("../../images/ui/res-wood.png")},
  {resName: "food", icon: require("../../images/ui/res-food.png")},
  {resName: "gold", icon: require("../../images/ui/res-gold.png")},
  {resName: "stone", icon: require("../../images/ui/res-stone.png")},
];

const numberStyle = css({
  fontVariantNumeric: "tabular-nums",
  minWidth: "2.5em",
});

const Number = ({val, color = "gray_100"}) => (
  <Text align="right" size="xs" weight="bold" css={numberStyle} color={color}>
    {val}
  </Text>
);

const stickyStyle = css({
  position: "sticky",
  top: 0,
  zIndex: 1,
});

const iconStyle = css({
  display: "block",
  maxHeight: "1.3rem",
  width: "auto",
});

const Header = ({time, res}) => (
  <Row bg="gray_600" elevation={1} css={stickyStyle} sp={0} px={1} py={0} align="center">
    <Row sp={1} bg="gray_800" pa={0}>
      <Number val={formatTime(time)} color="gray_300" />
    </Row>
    {resTypes.map(({resName, icon}) => (
      <Row
        sp={1}
        key={resName}
        align="center"
        bg={res[resName] < 0 ? "red_700" : "gray_900"}
        pa={0}
      >
        <img width={24} height={13} src={icon} alt={resName} css={iconStyle} />
        <Number val={Math.floor(res[resName])} />
      </Row>
    ))}
  </Row>
);

export default Header;
