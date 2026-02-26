import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import stripAnsi from "strip-ansi";

import { runFernCli } from "../../utils/runFernCli.js";
import { generateIrAsString } from "../ir/generateIrAsString.js";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("dependencies", () => {
    it("correctly incorporates dependencies", async ({ signal }) => {
        const ir = await generateIrAsString({
            fixturePath: join(FIXTURES_DIR, RelativeFilePath.of("simple")),
            apiName: "dependent",
            signal
        });
        expect(ir).toMatchSnapshot();
    }, 90_000);

    it("file dependencies", async ({ signal }) => {
        const ir = await generateIrAsString({
            fixturePath: join(FIXTURES_DIR, RelativeFilePath.of("file-dependencies")),
            apiName: "api-docs",
            signal
        });
        expect(ir.length).toMatchSnapshot();
    }, 90_000);

    it("fails when dependency does not exist", async ({ signal }) => {
        const { stdout } = await runFernCli(["check"], {
            cwd: join(FIXTURES_DIR, RelativeFilePath.of("non-existent-dependency")),
            reject: false,
            signal
        });
        expect(stdout).toContain("Failed to load dependency: @fern/non-existent-dependency");
    }, 90_000);

    it("fails when dependency is not listed in dependencies.yml", async ({ signal }) => {
        const { stdout } = await runFernCli(["check"], {
            cwd: join(FIXTURES_DIR, RelativeFilePath.of("unlisted-dependency")),
            reject: false,
            signal
        });
        expect(stripAnsi(stdout).trim()).toEqual(
            "[api]: Dependency is not listed in dependencies.yml: @fern/unlisted-dependency"
        );
    }, 90_000);

    it("fails when export package contains definitions", async ({ signal }) => {
        const { stdout } = await runFernCli(["check"], {
            cwd: join(FIXTURES_DIR, RelativeFilePath.of("other-definitions-specified")),
            reject: false,
            signal
        });
        expect(stripAnsi(stdout).trim()).toEqual("[api]: Exported package contains API definitions: package1");
    }, 90_000);

    it("fails when exporting package marker has non-export keys", async ({ signal }) => {
        const { stdout } = await runFernCli(["check"], {
            cwd: join(FIXTURES_DIR, RelativeFilePath.of("invalid-package-marker")),
            reject: false,
            signal
        });
        expect(stdout).toContain("imported/__package__.yml has an export so it cannot define other keys.");
    }, 90_000);
});
