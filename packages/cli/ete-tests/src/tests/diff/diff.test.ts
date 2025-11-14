import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readdir } from "fs/promises";
import path from "path";

import { diff } from "./diff";

const BREAKING_FIXTURES_DIR = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of("fixtures"),
    RelativeFilePath.of("breaking")
);

const NON_BREAKING_FIXTURES_DIR = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of("fixtures"),
    RelativeFilePath.of("non-breaking")
);

it("breaking", async () => {
    const breakingChangeDirs = await readdir(BREAKING_FIXTURES_DIR, { withFileTypes: true });
    for (const dir of breakingChangeDirs) {
        if (!dir.isDirectory()) {
            throw new Error(
                `${dir.name} is not a directory. All entries in ${BREAKING_FIXTURES_DIR} must be directories.`
            );
        }
        const result = await diff({
            fixturePath: AbsoluteFilePath.of(path.join(BREAKING_FIXTURES_DIR, dir.name)),
            fromVersion: "1.1.0"
        });
        expect(result.stdout).toMatchSnapshot();
        expect(result.exitCode).toBe(1);
    }
}, 20_000);

it("non-breaking", async () => {
    const nonBreakingChangeDirs = await readdir(NON_BREAKING_FIXTURES_DIR, { withFileTypes: true });
    for (const dir of nonBreakingChangeDirs) {
        if (!dir.isDirectory()) {
            throw new Error(
                `${dir.name} is not a directory. All entries in ${NON_BREAKING_FIXTURES_DIR} must be directories.`
            );
        }
        const result = await diff({
            fixturePath: AbsoluteFilePath.of(path.join(NON_BREAKING_FIXTURES_DIR, dir.name)),
            fromVersion: "1.1.0"
        });
        expect(result.stdout).toMatchSnapshot();
        expect(result.exitCode).toBe(0);
    }
}, 20_000);
