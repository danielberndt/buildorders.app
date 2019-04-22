import {css} from "@emotion/core";

export const createClasses = (
  type,
  steps,
  stepToRule = (step, type) => ({[type]: typeof step === "string" ? step : `${step}rem`})
) => {
  if (Array.isArray(steps)) {
    const classes = [];
    steps.forEach(step => {
      classes.push(css(stepToRule(step)));
    });
    return classes;
  } else {
    const classes = {};
    Object.entries(steps).forEach(([key, val]) => {
      classes[key] = css(stepToRule(val, type));
    });
    return classes;
  }
};
