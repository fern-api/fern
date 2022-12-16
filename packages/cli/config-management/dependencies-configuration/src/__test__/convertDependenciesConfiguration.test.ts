import { createMockTaskContext } from "@fern-api/task-context";
import { convertDependenciesConfiguration } from "../convertDependenciesConfiguration";
import { DependenciesConfiguration } from "../DependenciesConfiguration";
import { DependenciesConfigurationSchema } from "../schemas/DependenciesConfigurationSchema";

describe("convertDependenciesConfiguration", () => {
    it("basic", async () => {
        const rawDependenciesConfiguration: DependenciesConfigurationSchema = {
            dependencies: {
                "@fern/ir-types": "0.0.1",
                "@fern/fiddle": "0.2.0",
            },
        };
        const dependenciesConfiguration = convertDependenciesConfiguration({
            rawDependenciesConfiguration,
            context: createMockTaskContext(),
        });
        const expectedDependenciesConfiguration: DependenciesConfiguration = {
            dependencies: {
                "@fern/ir-types": {
                    apiName: "ir-types",
                    organization: "fern",
                    version: "0.0.1",
                },
                "@fern/fiddle": {
                    apiName: "fiddle",
                    organization: "fern",
                    version: "0.2.0",
                },
            },
        };
        expect(dependenciesConfiguration).toEqual(expectedDependenciesConfiguration);
    });
});
