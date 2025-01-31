import { ValidationViolation } from "./ValidationViolation";

export type RuleViolation = Pick<ValidationViolation, "message" | "name" | "severity">