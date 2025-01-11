import stripAnsi from "strip-ansi";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";
import { generateIrAsString } from "../ir/generateIrAsString";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("dependencies", () => {
    it("correctly incorporates dependencies", async () => {
        const ir = await generateIrAsString({
            fixturePath: join(FIXTURES_DIR, RelativeFilePath.of("simple")),
            apiName: "dependent"
        });
        expect(ir).toMatchSnapshot();
    }, 90_000);

    it("file dependencies", async () => {
        const ir = await generateIrAsString({
            fixturePath: join(FIXTURES_DIR, RelativeFilePath.of("file-dependencies")),
            apiName: "api-docs"
        });
        expect(ir.length).toMatchSnapshot();
    }, 90_000);

    it("fails when dependency does not exist", async () => {
        const { stdout } = await runFernCli(["check"], {
            cwd: join(FIXTURES_DIR, RelativeFilePath.of("non-existent-dependency")),
            reject: false
        });
        expect(stdout).toContain("Failed to load dependency: @fern/non-existent-dependency");
    }, 90_000);

    it("fails when dependency is not listed in dependencies.yml", async () => {
        const { stdout } = await runFernCli(["check"], {
            cwd: join(FIXTURES_DIR, RelativeFilePath.of("unlisted-dependency")),
            reject: false
        });
        expect(stripAnsi(stdout).trim()).toEqual(
            "[api]: Dependency is not listed in dependencies.yml: @fern/unlisted-dependency"
        );
    }, 90_000);

    it("fails when export package contains definitions", async () => {
        const { stdout } = await runFernCli(["check"], {
            cwd: join(FIXTURES_DIR, RelativeFilePath.of("other-definitions-specified")),
            reject: false
        });
        expect(stripAnsi(stdout).trim()).toEqual("[api]: Exported package contains API definitions: package1");
    }, 90_000);

    it("fails when exporting package marker has non-export keys", async () => {
        const { stdout } = await runFernCli(["check"], {
            cwd: join(FIXTURES_DIR, RelativeFilePath.of("invalid-package-marker")),
            reject: false
        });
        expect(stdout).toContain("imported/__package__.yml has an export so it cannot define other keys.");
    }, 90_000);
});
