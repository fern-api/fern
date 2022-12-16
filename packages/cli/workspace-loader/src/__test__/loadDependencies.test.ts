import { createMockTaskContext } from "@fern-api/task-context";
import { DependenciesFileSchema } from "@fern-api/yaml-schema";
import { DependenciesConfiguration, loadDependenciesConfiguration } from "../loadDependencies";

describe("parseDependenciesYaml", () => {
    it("basic", async () => {
        const dependenciesFile: DependenciesFileSchema = {
            dependencies: {
                "@fern/ir-types": "0.0.1",
                "@fern/fiddle": "0.2.0",
            },
        };
        const dependenciesConfiguration = loadDependenciesConfiguration({
            dependenciesFile,
            context: createMockTaskContext(),
        });
        const expectedDependenciesConfiguration: DependenciesConfiguration = {
            dependencies: {
                "@fern/ir-types": {
                    apiName: "ir-types",
                    org: "fern",
                    version: "0.0.1",
                },
                "@fern/fiddle": {
                    apiName: "fiddle",
                    org: "fern",
                    version: "0.2.0",
                },
            },
        };
        expect(dependenciesConfiguration).toEqual(expectedDependenciesConfiguration);
    });
});
