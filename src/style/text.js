import React from "react";
import tokens from "./tokens";
import {createClasses} from "./utils";

const classes = {
  color: createClasses("color", tokens.colors),

  fontSize: createClasses("fontSize", tokens.fontSizes),
  lineHeight: createClasses("lineHeight", tokens.lineHeight),
  textAlign: createClasses("textAlign", {center: "center", left: "left", right: "right"}),
  fontWeight: createClasses("fontWeight", {regular: 400, bold: 700}, (step, type) => ({
    [type]: step,
  })),
};

export const textClasses = classes;

const textPresets = {
  body: {
    color: "gray_100",
    size: "base",
    lineHeight: "tight",
  },
};

export const Text = React.forwardRef((props, ref) => {
  const preset = textPresets[props.preset] || textPresets.body;
  const {
    as: Comp = "div",
    preset: _,
    color = preset.color,
    size = preset.size,
    lineHeight = preset.lineHeight,
    align = preset.align,
    passThrough,
    weight,
    ...rest
  } = props;
  const cssList = [classes.fontSize[size]];
  if (weight) cssList.push(classes.fontWeight[weight]);
  if (lineHeight) cssList.push(classes.lineHeight[lineHeight]);
  if (align) cssList.push(classes.textAlign[align]);
  if (color) {
    cssList.push(classes.color[color]);
  }
  return <Comp ref={ref} css={cssList} {...rest} {...passThrough} />;
});
