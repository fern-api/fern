import { readFile, rm } from "fs/promises";
import path from "path";
import { runFernCli } from "../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("layout-v2", () => {
    itFixture("simple");
});

function itFixture(fixtureName: string) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            const irOutputPath = path.join(fixturePath, "ir.json");
            await rm(irOutputPath, { force: true, recursive: true });

            await runFernCli(["ir", "--output", irOutputPath], {
                cwd: fixturePath,
            });

            const irContents = await readFile(irOutputPath);
            expect(irContents.toString()).toMatchSnapshot();

            await rm(irOutputPath, { force: true, recursive: true });
        },
        90_000
    );
}
