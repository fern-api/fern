import { mkdir, readFile, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { convertOpenApi } from "../openapiConverter";

const OPEN_API_DEFINITION_FILENAME = "openapi.json";
const FERN_API_DEFINITION_FILENAME = "fern.yml";
const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern convert", () => {
    itFixture("direct-sales");
    itFixture("medplum");
});

function itFixture(fixtureName: string) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            const outputPath = path.join(fixturePath, "generated");
            await rm(outputPath, { force: true, recursive: true });

            const openApiPath = path.join(fixturePath, OPEN_API_DEFINITION_FILENAME);
            const conversionResult = await convertOpenApi(openApiPath);
            if (!conversionResult.didSucceed) {
                throw new Error("Conversion failed");
            }
            await mkdir(outputPath);
            await writeFile(
                `${outputPath}/${FERN_API_DEFINITION_FILENAME}`,
                yaml.dump(conversionResult.fernConfiguration, {
                    noRefs: true,
                })
            );
            const fileContents = await readFile(path.join(outputPath, FERN_API_DEFINITION_FILENAME));
            expect(fileContents.toString()).toMatchSnapshot();
        },
        90_000
    );
}
