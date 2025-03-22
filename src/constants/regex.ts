export const passwordRegex: RegExp = new RegExp(
  /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/
);
