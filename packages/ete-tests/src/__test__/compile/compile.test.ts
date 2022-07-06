import execa from "execa";
import { readFile, rm } from "fs/promises";
import path from "path";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern-compile-tests", () => {
    itFixture("simple");
});

function itFixture(fixtureName: string) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            const irOutputPath = path.join(fixturePath, "api", "ir.json");
            await rm(irOutputPath, { force: true, recursive: true });

            const cmd = execa(
                "node",
                [path.join(__dirname, "../../../../cli/webpack/dist/bundle.js"), "compile", "--writeIr"],
                {
                    cwd: fixturePath,
                }
            );
            cmd.stdout?.pipe(process.stdout);
            cmd.stderr?.pipe(process.stderr);
            await cmd;

            const irContents = await readFile(irOutputPath);
            expect(irContents.toString()).toMatchSnapshot();

            await rm(irOutputPath, { force: true, recursive: true });
        },
        90_000
    );
}
