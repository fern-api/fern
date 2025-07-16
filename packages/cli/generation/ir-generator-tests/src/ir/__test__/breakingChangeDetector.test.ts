/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-describe-callback */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { readdir } from "fs/promises"
import path from "path"

import { AbsoluteFilePath } from "@fern-api/fs-utils"
import { IntermediateRepresentationChangeDetector } from "@fern-api/ir-utils"

import { generateIRFromPath } from "./generateAndSnapshotIR"

const CHANGES_DIR = path.join(__dirname, "changes")

it("breaking", { timeout: 10_000 }, async () => {
    const breakingChangesDir = path.join(CHANGES_DIR, "breaking")
    const breakingChangeDirs = await readdir(breakingChangesDir, { withFileTypes: true })
    for (const dir of breakingChangeDirs) {
        if (!dir.isDirectory()) {
            throw new Error(`${dir.name} is not a directory. All entries in ${breakingChangesDir} must be directories.`)
        }
        const fromIR = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(path.join(breakingChangesDir, dir.name, "from", "fern")),
            workspaceName: dir.name,
            audiences: { type: "all" }
        })
        const toIR = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(path.join(breakingChangesDir, dir.name, "to", "fern")),
            workspaceName: dir.name,
            audiences: { type: "all" }
        })
        const detector = new IntermediateRepresentationChangeDetector()
        const result = await detector.check({
            from: fromIR,
            to: toIR
        })
        expect(result.bump).toBe("major")
        expect(result.isBreaking).toBe(true)
    }
})

it("non-breaking", { timeout: 10_000 }, async () => {
    const nonBreakingChangesDir = path.join(CHANGES_DIR, "non-breaking")
    const nonBreakingChangeDirs = await readdir(nonBreakingChangesDir, { withFileTypes: true })
    for (const dir of nonBreakingChangeDirs) {
        if (!dir.isDirectory()) {
            throw new Error(
                `${dir.name} is not a directory. All entries in ${nonBreakingChangesDir} must be directories.`
            )
        }
        const fromIR = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(path.join(nonBreakingChangesDir, dir.name, "from", "fern")),
            workspaceName: dir.name,
            audiences: { type: "all" }
        })
        const toIR = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(path.join(nonBreakingChangesDir, dir.name, "to", "fern")),
            workspaceName: dir.name,
            audiences: { type: "all" }
        })
        const detector = new IntermediateRepresentationChangeDetector()
        const result = await detector.check({
            from: fromIR,
            to: toIR
        })
        expect(result.bump).toBe("minor")
        expect(result.isBreaking).toBe(false)
    }
})
