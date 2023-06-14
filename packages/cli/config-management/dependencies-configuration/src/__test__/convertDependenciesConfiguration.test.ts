import { AbsoluteFilePath } from "@fern-api/fs-utils";
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
        const dependenciesConfiguration = await convertDependenciesConfiguration({
            rawDependenciesConfiguration,
            context: createMockTaskContext(),
            absolutePathToWorkspace: AbsoluteFilePath.of("/path/to/workspace"),
        });
        const expectedDependenciesConfiguration: DependenciesConfiguration = {
            dependencies: {
                "@fern/ir-types": {
                    type: "version",
                    apiName: "ir-types",
                    organization: "fern",
                    version: "0.0.1",
                },
                "@fern/fiddle": {
                    type: "version",
                    apiName: "fiddle",
                    organization: "fern",
                    version: "0.2.0",
                },
            },
        };
        expect(dependenciesConfiguration).toEqual(expectedDependenciesConfiguration);
    });
});
