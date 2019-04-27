// taken from tailwindcss

export const colors = {
  transparent: "transparent",

  black: "#000",
  white: "#fff",

  white_a05: "rgba(255,255,255,0.05)",
  white_a10: "rgba(255,255,255,0.10)",

  gray_100: "#FCFBF7",
  gray_200: "#EFEEE7",
  gray_300: "#D9D6CE",
  gray_400: "#BFBBB3",
  gray_500: "#9C9890",
  gray_600: "#6E6A64",
  gray_700: "#4A4641",
  gray_800: "#2B2621",
  gray_900: "#0B0806",

  red_100: "#fff5f5",
  red_200: "#fed7d7",
  red_300: "#feb2b2",
  red_400: "#fc8181",
  red_500: "#f56565",
  red_600: "#e53e3e",
  red_700: "#c53030",
  red_800: "#9b2c2c",
  red_900: "#742a2a",

  orange_100: "#fffaf0",
  orange_200: "#feebc8",
  orange_300: "#fbd38d",
  orange_400: "#f6ad55",
  orange_500: "#ed8936",
  orange_600: "#dd6b20",
  orange_700: "#c05621",
  orange_800: "#9c4221",
  orange_900: "#7b341e",

  yellow_100: "#fffff0",
  yellow_200: "#fefcbf",
  yellow_300: "#faf089",
  yellow_400: "#f6e05e",
  yellow_500: "#ecc94b",
  yellow_600: "#d69e2e",
  yellow_700: "#b7791f",
  yellow_800: "#975a16",
  yellow_900: "#744210",

  green_100: "#f0fff4",
  green_200: "#c6f6d5",
  green_300: "#9ae6b4",
  green_400: "#68d391",
  green_500: "#48bb78",
  green_600: "#38a169",
  green_700: "#2f855a",
  green_800: "#276749",
  green_900: "#22543d",

  teal_100: "#e6fffa",
  teal_200: "#b2f5ea",
  teal_300: "#81e6d9",
  teal_400: "#4fd1c5",
  teal_500: "#38b2ac",
  teal_600: "#319795",
  teal_700: "#2c7a7b",
  teal_800: "#285e61",
  teal_900: "#234e52",

  blue_100: "#ebf8ff",
  blue_200: "#bee3f8",
  blue_300: "#90cdf4",
  blue_400: "#63b3ed",
  blue_500: "#4299e1",
  blue_600: "#3182ce",
  blue_700: "#2b6cb0",
  blue_800: "#2c5282",
  blue_900: "#2a4365",

  indigo_100: "#ebf4ff",
  indigo_200: "#c3dafe",
  indigo_300: "#a3bffa",
  indigo_400: "#7f9cf5",
  indigo_500: "#667eea",
  indigo_600: "#5a67d8",
  indigo_700: "#4c51bf",
  indigo_800: "#434190",
  indigo_900: "#3c366b",

  purple_100: "#faf5ff",
  purple_200: "#e9d8fd",
  purple_300: "#d6bcfa",
  purple_400: "#b794f4",
  purple_500: "#9f7aea",
  purple_600: "#805ad5",
  purple_700: "#6b46c1",
  purple_800: "#553c9a",
  purple_900: "#44337a",

  pink_100: "#fff5f7",
  pink_200: "#fed7e2",
  pink_300: "#fbb6ce",
  pink_400: "#f687b3",
  pink_500: "#ed64a6",
  pink_600: "#d53f8c",
  pink_700: "#b83280",
  pink_800: "#97266d",
  pink_900: "#702459",
};

export default {
  spacings: [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6],
  shadows: {
    default: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    xxl: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  fontSizes: {
    xxs: 10 / 16,
    xs: 12 / 16,
    sm: 14 / 16,
    base: 16 / 16,
    lg: 18 / 16,
    xl: 22 / 16,
    xxl: 32 / 16,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  colors,
};
