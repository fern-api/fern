import { replaceEnvVariables } from "@fern-api/core-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { createMockTaskContext, FernCliError } from "@fern-api/task-context";

describe("substituteEnvVariables", () => {
    it("basic", () => {
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

        const context = createMockTaskContext();
        const substituted = replaceEnvVariables(content, { onError: (e) => context.failAndThrow(e) });

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
        const context = createMockTaskContext({ logger: NOOP_LOGGER });
        expect(() => replaceEnvVariables(content, { onError: (e) => context.failAndThrow(e) })).toThrow(FernCliError);
    });

    it("substitutes as empty in preview mode when substituteEnvVars is false", () => {
        process.env.TEST_VAR = "test-value";
        const content = {
            testField: "${TEST_VAR}"
        };

        const context = createMockTaskContext();
        // simulate preview mode with substituteEnvVars disabled
        const shouldSubstituteAsEmpty = true && !false; // preview && !substituteEnvVars
        const substituted = replaceEnvVariables(
            content,
            { onError: (e) => context.failAndThrow(e) },
            { substituteAsEmpty: shouldSubstituteAsEmpty }
        );

        expect(substituted.testField).toEqual("");
    });

    it("substitutes with actual values in preview mode when substituteEnvVars is true", () => {
        process.env.TEST_VAR = "test-value";
        const content = {
            testField: "${TEST_VAR}"
        };

        const context = createMockTaskContext();
        // simulate preview mode with substituteEnvVars enabled
        const shouldSubstituteAsEmpty = true && !true; // preview && !substituteEnvVars
        const substituted = replaceEnvVariables(
            content,
            { onError: (e) => context.failAndThrow(e) },
            { substituteAsEmpty: shouldSubstituteAsEmpty }
        );

        expect(substituted.testField).toEqual("test-value");
    });
});
