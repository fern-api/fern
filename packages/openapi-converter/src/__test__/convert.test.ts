import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createLogger } from "@fern-api/logger";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { OpenApiConverter } from "../openApiConverterV2";

// const OPEN_API_DEFINITION_FILENAME = "openapi.json";
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
            const openApiConverter = new OpenApiConverter({
                openApiFilePath: openApiPath,
                // eslint-disable-next-line no-console
                logger: createLogger((_level, ...args) => console.log(args.join(" "))),
            });
            const convertedFernDefinition = await openApiConverter.convert();
            await mkdir(outputPath);
            await writeFile(
                `${outputPath}/api.yml`,
                yaml.dump(convertedFernDefinition.rootApiFile, {
                    noRefs: true,
                })
            );
            const fileContents = await readFile(path.join(outputPath, "api.yml"));
            expect(fileContents.toString()).toMatchSnapshot();
        },
        90_000
    );
}
