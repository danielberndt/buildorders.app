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
  textShadow: "0 0.1em 0.25em #000",
});

const Number = ({val, color = "gray_100"}) => (
  <Text size="xs" weight="bold" css={numberStyle} color={color}>
    {val}
  </Text>
);

const iconStyle = css({
  display: "block",
  maxHeight: "1.3rem",
  width: "auto",
});

const resBoxStyle = css({
  flex: "3rem 1 1",
  maxWidth: "4rem",
  position: "relative",
});

const imgBox = css({
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
});

const ResBox = ({children, isBad, iconSrc, iconAlt, isWide}) => (
  <Row
    sp={1}
    bg={isBad ? "red_700" : "gray_900"}
    pa={0}
    css={[resBoxStyle, isWide && {maxWidth: "4.5rem"}]}
    justify="end"
  >
    <Row css={imgBox} pa={0} align="center">
      <img width={24} height={13} src={iconSrc} alt={iconAlt} css={iconStyle} />
    </Row>
    <div css={{position: "relative"}}>{children}</div>
  </Row>
);

const stickyStyle = css({
  position: "sticky",
  top: 0,
  zIndex: 5,
});

const Header = ({time, res}) => (
  <Row bg="gray_600" elevation={1} css={stickyStyle} sp={0} px={1} py={0} align="center">
    <Row sp={1} bg="gray_800" pa={0}>
      <Number val={formatTime(time)} color="gray_300" />
    </Row>
    {resTypes.map(({resName, icon}) => (
      <ResBox key={resName} isBad={res[resName] < 0} iconSrc={icon} iconAlt={resName}>
        <Number val={Math.floor(res[resName])} />
      </ResBox>
    ))}
    <ResBox
      isBad={res.popSpace > res.maxPopSpace}
      iconSrc={require("../../images/ui/res-pop.png")}
      iconAlt="pop space"
      isWide
    >
      <Row sp={0} align="baseline">
        <Number val={Math.floor(res.popSpace)} />
        <Text size="xxs" color="gray_300">
          /
        </Text>
        <Number val={Math.floor(res.maxPopSpace)} />
      </Row>
    </ResBox>
  </Row>
);

export default Header;
