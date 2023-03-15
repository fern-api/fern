import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import { formatDefinitionFile } from "../formatDefinitionFile";

const FIXTURES: RelativeFilePath[] = [
    "lang-server/without-lang-server.yml",
    "lang-server/with-lang-server.yml",
    "no-newlines.yml",
    "lots-of-newlines.yml",
    "headers/file-header-with-newline.yml",
    "headers/file-header-without-newline.yml",
];

describe("formatDefinitionFile", () => {
    for (const fixturePath of FIXTURES) {
        // eslint-disable-next-line jest/valid-title
        it(fixturePath, async () => {
            const formatted = await formatForTest(fixturePath);
            expect(formatted).toMatchSnapshot();
        });
    }
});

async function formatForTest(fixturePath: RelativeFilePath): Promise<string> {
    const absoluteFilepath = join(AbsoluteFilePath.of(__dirname), "fixtures", fixturePath);
    return formatDefinitionFile({
        absoluteFilepath,
        fileContents: (await readFile(absoluteFilepath)).toString(),
    });
}
