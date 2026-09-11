export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: "700" as const },
  h2: { fontSize: 20, fontWeight: "700" as const },
  h3: { fontSize: 16, fontWeight: "600" as const },
  body: { fontSize: 14, fontWeight: "400" as const },
  caption: { fontSize: 12, fontWeight: "400" as const },
  label: { fontSize: 12, fontWeight: "600" as const },
};
