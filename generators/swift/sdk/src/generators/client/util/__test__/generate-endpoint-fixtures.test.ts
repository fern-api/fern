/**
 * One-time fixture generator — run with: npx vitest run src/generators/client/util/__test__/generate-endpoint-fixtures.test.ts
 *
 * Extracts the minimal endpoint path data needed by formatEndpointPathForSwift from every
 * test definition and writes it to endpoint-fixtures.json. This avoids having to call
 * createSampleIr (slow) at test time in format-endpoint-path-for-swift.test.ts.
 *
 * Re-run this whenever test-definitions change.
 */
import { readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createSampleIr } from "@fern-api/test-utils";

const pathToTestDefinitions = resolve(__dirname, "../../../../../../../../test-definitions/fern/apis");
const outputPath = resolve(__dirname, "endpoint-fixtures.json");

it("generate endpoint fixtures", async () => {
    const testDefinitionNames = readdirSync(pathToTestDefinitions, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    const fixtures: Record<
        string,
        {
            services: Record<
                string,
                {
                    endpoints: Array<{
                        fullPath: {
                            head: string;
                            parts: Array<{ pathParameter: string; tail: string }>;
                        };
                        allPathParameters: Array<{
                            name: { originalName: string; camelCase: { unsafeName: string } };
                            docs: string | undefined;
                        }>;
                    }>;
                }
            >;
        }
    > = {};

    for (const name of testDefinitionNames) {
        const absolutePath = AbsoluteFilePath.of(resolve(pathToTestDefinitions, name));
        const ir = await createSampleIr(absolutePath, { version: "v59" });

        const services: (typeof fixtures)[string]["services"] = {};
        for (const [serviceName, service] of Object.entries(ir.services)) {
            services[serviceName] = {
                endpoints: service.endpoints.map((endpoint) => ({
                    fullPath: {
                        head: endpoint.fullPath.head,
                        parts: endpoint.fullPath.parts.map((part) => ({
                            pathParameter: part.pathParameter,
                            tail: part.tail
                        }))
                    },
                    allPathParameters: endpoint.allPathParameters.map((param) => ({
                        name: {
                            originalName: param.name.originalName,
                            camelCase: { unsafeName: param.name.camelCase.unsafeName }
                        },
                        docs: param.docs
                    }))
                }))
            };
        }
        fixtures[name] = { services };
    }

    writeFileSync(outputPath, JSON.stringify(fixtures, null, 2) + "\n");
    console.log(`Written endpoint fixtures to ${outputPath}`);
}, 300_000);
