import { createMockTaskContext, TaskResult } from "@fern-api/task-context";
import { substituteEnvVariables } from "../substituteEnvVariables";

describe("substituteEnvVariables", () => {
    it("basic", () => {
        process.env.FOO_VAR = "foo";
        process.env.BAR_VAR = "bar";
        const content = {
            foo: "bar",
            baz: {
                qux: {
                    thud: "${FOO_VAR}",
                },
            },
            plugh: "${FOO_VAR}-${BAR_VAR}",
        };
        const context = createMockTaskContext();
        const substituted = substituteEnvVariables(content, context);

        expect(substituted).toEqual({ foo: "bar", baz: { qux: { thud: "foo" } }, plugh: "foo-bar" });
        expect(context.getResult()).toBe(TaskResult.Success);
    });

    it("fails with undefined env var", () => {
        process.env.FOO_VAR = "foo";
        const content = {
            foo: "bar",
            baz: {
                qux: {
                    thud: "${UNDEFINED_ENV_VAR}",
                },
            },
            plugh: "${FOO_VAR}",
        };
        const context = createMockTaskContext();
        substituteEnvVariables(content, context);
        expect(context.getResult()).toBe(TaskResult.Failure);
    });
});
