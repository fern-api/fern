/**
 * Vitest globalSetup hook — auto-generates endpoint-fixtures.json before tests load.
 *
 * Compares a hash of the test-definitions directory listing against the hash stored
 * in the fixture file. Only regenerates if the definitions have changed or the fixture
 * is missing.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createSampleIr } from "@fern-api/test-utils";

const pathToTestDefinitions = resolve(__dirname, "../../../../../../../../test-definitions/fern/apis");
const outputPath = resolve(__dirname, "endpoint-fixtures.json");

function getDefinitionsHash(): string {
    const names = readdirSync(pathToTestDefinitions, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .sort();
    return createHash("sha256").update(names.join("\n")).digest("hex");
}

function isFixtureUpToDate(): boolean {
    if (!existsSync(outputPath)) {
        return false;
    }
    try {
        const content = readFileSync(outputPath, "utf-8");
        const parsed = JSON.parse(content);
        return parsed._definitionsHash === getDefinitionsHash();
    } catch {
        return false;
    }
}

export async function setup(): Promise<void> {
    if (isFixtureUpToDate()) {
        return;
    }

    const testDefinitionNames = readdirSync(pathToTestDefinitions, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    const fixtures: Record<string, unknown> = {
        _definitionsHash: getDefinitionsHash()
    };

    for (const name of testDefinitionNames) {
        const absolutePath = AbsoluteFilePath.of(resolve(pathToTestDefinitions, name));
        const ir = await createSampleIr(absolutePath, { version: "v59" });

        const services: Record<
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
        > = {};

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
}
