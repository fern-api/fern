import { GeneratorConfig, GeneratorEnvironment } from "@fern-fern/generator-exec-client/model/config";
import { execa } from "execa";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { writeOpenApi } from "../../src/writeOpenApi";

const FIXTURES = ["test-api", "any-auth"];

describe("convertToOpenApi", () => {
    for (const fixture of FIXTURES) {
        const fixtureDir = path.join(__dirname, "fixtures");
        // eslint-disable-next-line jest/valid-title
        it(
            fixture,
            async () => {
                const tmpDir = await tmp.dir();
                const openapiPath = path.join(tmpDir.path, "openapi.yml");
                const confgPath = path.join(tmpDir.path, "config.json");
                const irPath = path.join(tmpDir.path, "ir.json");

                const generatorConfig: GeneratorConfig = {
                    irFilepath: irPath,
                    output: tmpDir,
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

                await writeOpenApi(confgPath);

                const openApi = (await readFile(openapiPath)).toString();

                expect(openApi).toMatchSnapshot();
            },
            90_000
        );
    }
});
