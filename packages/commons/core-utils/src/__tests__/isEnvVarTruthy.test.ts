import { isEnvVarTruthy } from "../isEnvVarTruthy.js";

describe("isEnvVarTruthy", () => {
    it("returns false when unset", () => {
        expect(isEnvVarTruthy(undefined)).toBe(false);
        expect(isEnvVarTruthy("")).toBe(false);
        expect(isEnvVarTruthy("   ")).toBe(false);
    });

    it("recognizes truthy values", () => {
        for (const value of ["1", "true", "TRUE", " True ", "yes", "YES", "on"]) {
            expect(isEnvVarTruthy(value)).toBe(true);
        }
    });

    it("recognizes falsy values", () => {
        for (const value of ["0", "false", "FALSE", "no", "off", "banana"]) {
            expect(isEnvVarTruthy(value)).toBe(false);
        }
    });

    it("tolerates surrounding quotes", () => {
        // `docker run -e KEY="value"` passes the quotes through literally, since the
        // container runner is invoked without a shell to strip them.
        expect(isEnvVarTruthy('"true"')).toBe(true);
        expect(isEnvVarTruthy("'1'")).toBe(true);
        expect(isEnvVarTruthy('"false"')).toBe(false);
    });
});
