import type { ValidationViolation } from "./ValidationViolation.js";

/**
 * A general-purpose validation error containing violations.
 *
 * When displayed, each violation is shown on its own line with filepath prefix
 * and severity-appropriate coloring.
 */
export class ValidationError extends Error {
    public readonly violations: ValidationViolation[];

    constructor(violations: ValidationViolation[]) {
        super(violations.map((v) => `${v.relativeFilepath}: ${v.message}`).join("\n"));
        this.violations = violations;
    }
}
