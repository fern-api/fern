import { writeFile } from "fs/promises";

import { FERNIGNORE_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

const FERNIGNORE_FILECONTENTS = `
fern.js
**/*.txt
`;

const FERN_JS_FILENAME = "fern.js";
const FERN_JS_FILECONTENTS = `
#!/usr/bin/env node
console.log('Water the plants')
`;

const DUMMY_TXT_FILENAME = "dummy.txt";
const DUMMY_TXT_FILECONTENTS = `
Practice schema-first API design with Fern
`;

describe("fern generate --local", () => {
    // eslint-disable-next-line jest/expect-expect
    it("Keep files listed in .fernignore from unmodified", async () => {
        const pathOfDirectory = await init();
        await runFernCli(["generate", "--local", "--keepDocker"], {
            cwd: pathOfDirectory
        });

        // write custom files and override
        const absolutePathToLocalOutput = join(pathOfDirectory, RelativeFilePath.of("sdks/typescript"));

        const absolutePathToFernignore = join(absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME));
        await writeFile(absolutePathToFernignore, FERNIGNORE_FILECONTENTS);

        const absolutePathToFernJs = join(absolutePathToLocalOutput, RelativeFilePath.of(FERN_JS_FILENAME));
        await writeFile(absolutePathToFernJs, FERN_JS_FILECONTENTS);

        const absolutePathToDummyText = join(absolutePathToLocalOutput, RelativeFilePath.of(DUMMY_TXT_FILENAME));
        await writeFile(absolutePathToDummyText, DUMMY_TXT_FILECONTENTS);

        await runFernCli(["generate", "--local", "--keepDocker"], {
            cwd: pathOfDirectory
        });

        await expectPathExists(absolutePathToFernignore);
        await expectPathExists(absolutePathToFernJs);
        await expectPathDoesNotExist(absolutePathToDummyText);

        // rerun and make sure no issues if there are no changes
        await runFernCli(["generate", "--local", "--keepDocker"], {
            cwd: pathOfDirectory
        });
    }, 360_000);
});

async function expectPathDoesNotExist(absoluteFilePath: AbsoluteFilePath): Promise<void> {
    expect(await doesPathExist(absoluteFilePath)).toBe(false);
}

async function expectPathExists(absoluteFilePath: AbsoluteFilePath): Promise<void> {
    expect(await doesPathExist(absoluteFilePath)).toBe(true);
}
