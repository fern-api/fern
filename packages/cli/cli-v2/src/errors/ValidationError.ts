import { CliError } from "@fern-api/task-context";

import type { ValidationViolation } from "./ValidationViolation.js";

/**
 * A general-purpose validation error containing violations.
 *
 * When displayed, each violation is shown on its own line with filepath prefix
 * and severity-appropriate coloring.
 */
export class ValidationError extends CliError {
    public readonly violations: ValidationViolation[];

    constructor(violations: ValidationViolation[]) {
        super({
            message: violations.map((v) => `${v.relativeFilepath}: ${v.message}`).join("\n"),
            code: CliError.Code.ValidationError
        });
        Object.setPrototypeOf(this, ValidationError.prototype);
        this.violations = violations;
    }
}
