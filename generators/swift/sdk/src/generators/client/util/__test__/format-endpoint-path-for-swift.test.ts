import { readdirSync } from "node:fs";
import { resolve } from "node:path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createSampleIr } from "@fern-api/test-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { formatEndpointPathForSwift } from "../format-endpoint-path-for-swift";

const pathToTestDefinitions = resolve(__dirname, "../../../../../../../../test-definitions/fern/apis");
const testDefinitionNames = readdirSync(pathToTestDefinitions, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

async function getIRForTestDefinition(testDefinitionName: string): Promise<IntermediateRepresentation> {
    const absolutePathToWorkspace = AbsoluteFilePath.of(resolve(pathToTestDefinitions, testDefinitionName));
    return (await createSampleIr(absolutePathToWorkspace, {
        version: "v60" // make sure to upgrade this when the IR version is upgraded
    })) as IntermediateRepresentation;
}

describe.each(testDefinitionNames)("formatEndpointPathForSwift - %s", (testDefinitionName) => {
    // This allows us to conveniently review the formatted endpoint paths for every test definition in a single location

    it("correctly formats all endpoint paths for definition", async () => {
        const ir = await getIRForTestDefinition(testDefinitionName);
        const endpointPathsByService = Object.fromEntries(
            Object.entries(ir.services).map(([serviceName, service]) => {
                return [
                    serviceName,
                    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                    service.endpoints.map((endpoint) => formatEndpointPathForSwift(endpoint as any))
                ] as const;
            })
        );
        const fileContents = Object.entries(endpointPathsByService)
            .map(([serviceName, paths]) => ({ serviceName, serviceContent: paths.map((p) => `"${p}"`).join("\n") }))
            .map(({ serviceName, serviceContent }) => `// ${serviceName}\n${serviceContent}`)
            .join("\n\n");
        await expect(fileContents).toMatchFileSnapshot(
            `snapshots/formatted-endpoint-paths/${testDefinitionName}.swift`
        );
    }, 10_000);
});
