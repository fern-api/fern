import { NOOP_LOGGER } from "@fern-api/logger";
import { createMockTaskContext, FernCliError } from "@fern-api/task-context";
import { substituteEnvVariables } from "../substituteEnvVariables";

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
        const substituted = substituteEnvVariables(content, createMockTaskContext());

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
        expect(() => substituteEnvVariables(content, createMockTaskContext({ logger: NOOP_LOGGER }))).toThrow(
            FernCliError
        );
    });
});
