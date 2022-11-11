/* eslint-disable jest/valid-title */
import {
    GeneratorConfig,
    GeneratorEnvironment,
    GithubPublishInfo,
    OutputMode,
} from "@fern-fern/generator-exec-sdk/resources";
import * as PostmanParsing from "@fern-fern/postman-sdk/serialization";
import { execa } from "execa";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { COLLECTION_OUTPUT_FILENAME, writePostmanCollection } from "../writePostmanCollection";

const FIXTURES = ["test-api", "any-auth"];

interface RequestResponse {
    request: any;
    response: any;
}

describe("convertToPostman", () => {
    for (const fixture of FIXTURES) {
        // eslint-disable-next-line jest/valid-title
        const fixtureDir = path.join(__dirname, "fixtures");
        it(fixture, async () => {
            const tmpDir = await tmp.dir();
            const collectionPath = path.join(tmpDir.path, COLLECTION_OUTPUT_FILENAME);
            const confgPath = path.join(tmpDir.path, "config.json");
            const irPath = path.join(tmpDir.path, "ir.json");

            const generatorConfig: GeneratorConfig = {
                dryRun: true,
                irFilepath: irPath,
                output: {
                    path: tmpDir.path,
                    mode: OutputMode.github({
                        repoUrl: "fern-api/fake",
                        version: "0.0.0",
                        publishInfo: GithubPublishInfo.postman({
                            apiKeyEnvironmentVariable: "API_KEY",
                            workspaceIdEnvironmentVariable: "WORKSPACE_ID",
                        }),
                    }),
                },
                publish: undefined,
                workspaceName: "fern",
                organization: "fern",
                customConfig: undefined,
                environment: GeneratorEnvironment.local(),
            };

            await writeFile(confgPath, JSON.stringify(generatorConfig, undefined, 4));

            await execa("fern", ["ir", irPath, "--api", fixture], {
                cwd: fixtureDir,
            });

            await writePostmanCollection(confgPath);

            const postmanCollection = (await readFile(collectionPath)).toString();

            expect(postmanCollection).toMatchSnapshot();

            const rawPostmanCollection = JSON.parse(postmanCollection);
            const parsedOpenApi = PostmanParsing.PostmanCollectionSchema.parse(rawPostmanCollection);

            const examples: RequestResponse[] = [];
            parsedOpenApi.item.forEach((serviceItem) => {
                serviceItem.item.forEach((item) => {
                    item.response.forEach((response) => {
                        examples.push({
                            request:
                                response.originalRequest.body != null
                                    ? JSON.parse(response.originalRequest.body.raw)
                                    : undefined,
                            response: JSON.parse(response.body),
                        });
                    });
                });
            });
            expect(examples).toMatchSnapshot();
        });
    }
});
