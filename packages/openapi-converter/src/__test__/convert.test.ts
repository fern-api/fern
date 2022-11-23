import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { convertOpenApi } from "../openapiConverter";

// const OPEN_API_DEFINITION_FILENAME = "openapi.json";
const FERN_API_DEFINITION_FILENAME = "fern.yml";
const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), "fixtures");

interface Fixture {
    name: string;
    folder: RelativeFilePath;
    openApiFile: RelativeFilePath;
}

describe("fern convert", () => {
    // itFixture("direct-sales");
    // itFixture("medplum");
    itFixture({
        name: "happay",
        folder: "happay",
        openApiFile: "openapi.yml",
    });
});

function itFixture(fixture: Fixture) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixture.name,
        async () => {
            const fixturePath = join(FIXTURES_DIR, fixture.folder);
            const outputPath = join(fixturePath, "generated");
            await rm(outputPath, { force: true, recursive: true });

            const openApiPath = join(fixturePath, fixture.openApiFile);
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
