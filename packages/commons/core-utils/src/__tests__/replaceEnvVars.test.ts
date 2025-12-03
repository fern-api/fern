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

    it("converts escaped env var pattern to literal without substitution", () => {
        process.env.HOST = "example.com";
        const content = {
            escaped: "http://\\$\\{HOST\\}",
            normal: "${HOST}"
        };
        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted.escaped).toEqual("http://${HOST}");
        expect(substituted.normal).toEqual("example.com");
    });

    it("handles mixed escaped and non-escaped patterns in same string", () => {
        process.env.API_KEY = "secret123";
        const content = "Use \\$\\{API_KEY\\} syntax to reference ${API_KEY}";
        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual("Use ${API_KEY} syntax to reference secret123");
    });

    it("escaped patterns are not substituted even with substituteAsEmpty flag", () => {
        const content = "http://\\$\\{HOST\\}";
        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError }, { substituteAsEmpty: true });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual("http://${HOST}");
    });
});
