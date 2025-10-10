/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-describe-callback */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentationChangeDetector } from "@fern-api/ir-utils";
import { readdir } from "fs/promises";
import path from "path";

import { generateIRFromPath } from "./generateAndSnapshotIR";

const CHANGES_DIR = path.join(__dirname, "changes");

it("breaking", { timeout: 10_000 }, async () => {
    const breakingChangesDir = path.join(CHANGES_DIR, "breaking");
    const breakingChangeDirs = await readdir(breakingChangesDir, { withFileTypes: true });
    for (const dir of breakingChangeDirs) {
        if (!dir.isDirectory()) {
            throw new Error(
                `${dir.name} is not a directory. All entries in ${breakingChangesDir} must be directories.`
            );
        }
        const fromIR = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(path.join(breakingChangesDir, dir.name, "from", "fern")),
            workspaceName: dir.name,
            audiences: { type: "all" }
        });
        const toIR = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(path.join(breakingChangesDir, dir.name, "to", "fern")),
            workspaceName: dir.name,
            audiences: { type: "all" }
        });
        const detector = new IntermediateRepresentationChangeDetector();
        const result = await detector.check({
            from: fromIR,
            to: toIR
        });
        expect(result.bump).toBe("major");
        expect(result.isBreaking).toBe(true);
    }
});

it("non-breaking", { timeout: 10_000 }, async () => {
    const nonBreakingChangesDir = path.join(CHANGES_DIR, "non-breaking");
    const nonBreakingChangeDirs = await readdir(nonBreakingChangesDir, { withFileTypes: true });
    for (const dir of nonBreakingChangeDirs) {
        if (!dir.isDirectory()) {
            throw new Error(
                `${dir.name} is not a directory. All entries in ${nonBreakingChangesDir} must be directories.`
            );
        }
        const fromIR = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(path.join(nonBreakingChangesDir, dir.name, "from", "fern")),
            workspaceName: dir.name,
            audiences: { type: "all" }
        });
        const toIR = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(path.join(nonBreakingChangesDir, dir.name, "to", "fern")),
            workspaceName: dir.name,
            audiences: { type: "all" }
        });
        const detector = new IntermediateRepresentationChangeDetector();
        const result = await detector.check({
            from: fromIR,
            to: toIR
        });
        expect(result.bump).toBe("minor");
        expect(result.isBreaking).toBe(false);
    }
});

it("identical IRs should return null bump", { timeout: 10_000 }, async () => {
    // Use the first non-breaking change directory to get a valid IR
    const nonBreakingChangesDir = path.join(CHANGES_DIR, "non-breaking");
    const nonBreakingChangeDirs = await readdir(nonBreakingChangesDir, { withFileTypes: true });
    const firstDir = nonBreakingChangeDirs.find((dir) => dir.isDirectory());

    if (!firstDir) {
        throw new Error("No test directories found for identical IR test");
    }

    const testIR = await generateIRFromPath({
        absolutePathToWorkspace: AbsoluteFilePath.of(path.join(nonBreakingChangesDir, firstDir.name, "from", "fern")),
        workspaceName: firstDir.name,
        audiences: { type: "all" }
    });

    const detector = new IntermediateRepresentationChangeDetector();
    const result = await detector.check({
        from: testIR,
        to: testIR // Compare the same IR to itself
    });

    expect(result.bump).toBe(null);
    expect(result.isBreaking).toBe(false);
    expect(result.errors).toEqual([]);
});
