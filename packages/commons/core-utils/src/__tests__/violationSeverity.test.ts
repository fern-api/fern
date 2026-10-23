import { DEFAULT_VIOLATION_SEVERITY, resolveViolationSeverity } from "../fallbacks/violationSeverity.js";

describe("resolveViolationSeverity", () => {
    it("falls back to fatal when the violation has no severity", () => {
        expect(DEFAULT_VIOLATION_SEVERITY).toBe("fatal");
        expect(resolveViolationSeverity(undefined)).toBe("fatal");
    });

    it.each(["fatal", "error", "warning"] as const)("keeps %s", (severity) => {
        expect(resolveViolationSeverity(severity)).toBe(severity);
    });
});
