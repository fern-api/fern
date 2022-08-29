import { createMockTaskContext, TaskResult } from "@fern-api/task-context";
import { substituteEnvVariables } from "../substituteEnvVariables";

describe("substituteEnvVariables", () => {
    it("basic", () => {
        process.env.ENV_VAR = "test";
        const content = {
            foo: "bar",
            baz: {
                qux: {
                    thud: "${ENV_VAR}",
                },
            },
            plugh: "${ENV_VAR}",
        };
        const context = createMockTaskContext();
        const substituted = substituteEnvVariables(content, context);

        expect(substituted).toEqual({ foo: "bar", baz: { qux: { thud: "test" } }, plugh: "test" });
        expect(context.getResult()).toBe(TaskResult.Success);
    });

    it("fails with undefined env var", () => {
        process.env.ENV_VAR = "test";
        const content = {
            foo: "bar",
            baz: {
                qux: {
                    thud: "${UNDEFINED_ENV_VAR}",
                },
            },
            plugh: "${ENV_VAR}",
        };
        const context = createMockTaskContext();
        substituteEnvVariables(content, context);
        expect(context.getResult()).toBe(TaskResult.Failure);
    });
});
