import { vi } from "vitest";

import { replaceEnvVariables } from "../replaceEnvVars";

describe("replaceEnvVariables", () => {
    it("works and can replace templated env vars, even when they are nested", () => {
        process.env.FOO_VAR = "foo";
        process.env.BAR_VAR = "bar";
        const content = {
            foo: "bar",
            baz: {
                qux: {
                    thud: "${FOO_VAR}"
                }
            },
            plugh: "${FOO_VAR}-${BAR_VAR}"
        };

        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError });

        expect(substituted).toEqual({ foo: "bar", baz: { qux: { thud: "foo" } }, plugh: "foo-bar" });
    });

    it("fails with undefined env var", () => {
        process.env.FOO_VAR = "foo";
        const content = {
            foo: "bar",
            baz: {
                qux: {
                    thud: "${UNDEFINED_ENV_VAR}"
                }
            },
            plugh: "${FOO_VAR}"
        };
        const onError = vi.fn();
        replaceEnvVariables(content, { onError }, { substituteAsEmpty: false });
        expect(onError).toHaveBeenCalled();
    });

    it("Always substitutes empty string when flag is set", () => {
        process.env.FOO_VAR = "foo";
        const content = {
            foo: "bar",
            baz: {
                qux: {
                    thud: "${UNDEFINED_ENV_VAR}"
                }
            },
            plugh: "${FOO_VAR}"
        };
        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError }, { substituteAsEmpty: true });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted.foo).toEqual("bar");
        expect(substituted.baz.qux.thud).toEqual("");
        expect(substituted.plugh).toEqual("");
    });
});
