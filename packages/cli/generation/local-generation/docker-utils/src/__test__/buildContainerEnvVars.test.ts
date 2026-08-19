import { buildContainerEnvVars } from "../buildContainerEnvVars.js";

describe("buildContainerEnvVars", () => {
    it("forwards host env vars that the generators read", () => {
        expect(
            buildContainerEnvVars({
                envVars: {},
                processEnv: { FERN_STACK_TRACK: "1", FERN_JAVA_SKIP_FORMATTING: "true" }
            })
        ).toEqual({
            envVars: { FERN_STACK_TRACK: "1", FERN_JAVA_SKIP_FORMATTING: "true" },
            forwardedFromHost: ["FERN_STACK_TRACK", "FERN_JAVA_SKIP_FORMATTING"]
        });
    });

    it("ignores host env vars that are unset or empty", () => {
        expect(buildContainerEnvVars({ envVars: {}, processEnv: { FERN_STACK_TRACK: "" } })).toEqual({
            envVars: {},
            forwardedFromHost: []
        });
        expect(buildContainerEnvVars({ envVars: {}, processEnv: {} })).toEqual({
            envVars: {},
            forwardedFromHost: []
        });
    });

    it("keeps unrelated host env vars out of the container", () => {
        expect(buildContainerEnvVars({ envVars: {}, processEnv: { AWS_SECRET_ACCESS_KEY: "hunter2" } })).toEqual({
            envVars: {},
            forwardedFromHost: []
        });
    });

    it("lets explicitly passed env vars win over forwarded ones", () => {
        expect(
            buildContainerEnvVars({
                envVars: { FERN_JAVA_SKIP_FORMATTING: "false" },
                processEnv: { FERN_JAVA_SKIP_FORMATTING: "true" }
            })
        ).toEqual({
            envVars: { FERN_JAVA_SKIP_FORMATTING: "false" },
            forwardedFromHost: []
        });
    });

    it("does not mutate the env vars it was given", () => {
        const envVars = { MY_VAR: "value" };
        buildContainerEnvVars({ envVars, processEnv: { FERN_STACK_TRACK: "1" } });
        expect(envVars).toEqual({ MY_VAR: "value" });
    });
});
