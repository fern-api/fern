import { describe, expect, it } from "vitest";
import { toRegisterDynamicIRsInput } from "../toRegisterDynamicIRsInput.js";

describe("toRegisterDynamicIRsInput", () => {
    it("returns undefined when there are no dynamic IRs", () => {
        expect(toRegisterDynamicIRsInput(undefined)).toBeUndefined();
    });

    it("preserves the language keys", () => {
        const result = toRegisterDynamicIRsInput({
            python: { dynamicIR: { types: {} } },
            typescript: { dynamicIR: { types: {} } }
        });

        expect(Object.keys(result ?? {}).sort()).toEqual(["python", "typescript"]);
    });

    it("strips the IR bodies so they are not sent in the registration request", () => {
        const dynamicIR = { types: { User: { name: "User" } } };
        const result = toRegisterDynamicIRsInput({ python: { dynamicIR }, go: { dynamicIR } });

        expect(result).toEqual({ python: {}, go: {} });
        expect(JSON.stringify(result)).not.toContain("User");
    });
});
