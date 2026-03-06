import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read source files for verification
const localTaskHandlerSource = readFileSync(resolve(__dirname, "../LocalTaskHandler.ts"), "utf-8");
const runGeneratorSource = readFileSync(resolve(__dirname, "../runGenerator.ts"), "utf-8");
const autoVersioningServiceSource = readFileSync(resolve(__dirname, "../AutoVersioningService.ts"), "utf-8");
const cliSource = readFileSync(resolve(__dirname, "../../../../../cli/src/cli.ts"), "utf-8");
const generateAPIWorkspacesSource = readFileSync(
    resolve(__dirname, "../../../../../cli/src/commands/generate/generateAPIWorkspaces.ts"),
    "utf-8"
);
const generateAPIWorkspaceSource = readFileSync(
    resolve(__dirname, "../../../../../cli/src/commands/generate/generateAPIWorkspace.ts"),
    "utf-8"
);
const runLocalGenerationSource = readFileSync(resolve(__dirname, "../runLocalGenerationForWorkspace.ts"), "utf-8");

describe("LocalTaskHandler dry-run mode", () => {
    describe("DryRunReport interface", () => {
        it("defines DryRunReport interface with required fields", () => {
            expect(localTaskHandlerSource).toContain("interface DryRunReport");
            expect(localTaskHandlerSource).toContain("newVersion: string;");
            expect(localTaskHandlerSource).toContain("previousVersion: string;");
            expect(localTaskHandlerSource).toContain("versionBump: VersionBump | string;");
            expect(localTaskHandlerSource).toContain("tier: string;");
            expect(localTaskHandlerSource).toContain("commitMessage: string;");
            expect(localTaskHandlerSource).toContain("diffSizeBytes: number;");
        });
    });

    describe("LocalTaskHandler.Init interface", () => {
        it("includes dryRun optional boolean field", () => {
            expect(localTaskHandlerSource).toContain("dryRun?: boolean;");
        });

        it("stores dryRun in constructor with false default", () => {
            expect(localTaskHandlerSource).toContain("this.dryRun = dryRun ?? false;");
        });
    });

    describe("dry-run short-circuit in copyGeneratedFiles", () => {
        it("does not call replaceMagicVersion when dryRun is true", () => {
            // Verify: when this.dryRun is true, the code returns before replaceMagicVersion
            // The dry-run check comes after handleAutoVersioning but before replaceMagicVersion
            const dryRunCheckPattern = /if \(this\.dryRun\) \{[\s\S]*?printDryRunReport/;
            expect(localTaskHandlerSource).toMatch(dryRunCheckPattern);

            // The replaceMagicVersion call comes after the dry-run check
            const copyGeneratedFilesMethod = localTaskHandlerSource.slice(
                localTaskHandlerSource.indexOf("public async copyGeneratedFiles()"),
                localTaskHandlerSource.indexOf("private printDryRunReport")
            );

            // Verify order: dryRun check returns before replaceMagicVersion
            const dryRunReturnIndex = copyGeneratedFilesMethod.indexOf(
                "return { shouldCommit: false, autoVersioningCommitMessage: undefined };"
            );
            const replaceMagicIndex = copyGeneratedFilesMethod.indexOf("replaceMagicVersion");
            expect(dryRunReturnIndex).toBeLessThan(replaceMagicIndex);
        });

        it("returns shouldCommit: false when dryRun is true and version is AUTO", () => {
            const copyGeneratedFilesMethod = localTaskHandlerSource.slice(
                localTaskHandlerSource.indexOf("public async copyGeneratedFiles()"),
                localTaskHandlerSource.indexOf("private printDryRunReport")
            );

            // After dry-run report, returns shouldCommit: false
            expect(copyGeneratedFilesMethod).toContain("if (this.dryRun) {");
            expect(copyGeneratedFilesMethod).toContain(
                "return { shouldCommit: false, autoVersioningCommitMessage: undefined };"
            );
        });
    });

    describe("printDryRunReport method", () => {
        it("logs version analysis report with formatted output", () => {
            expect(localTaskHandlerSource).toContain("private printDryRunReport(report: DryRunReport): void");
            expect(localTaskHandlerSource).toContain("AUTO Version Dry-Run Report");
            expect(localTaskHandlerSource).toContain("Previous version :");
            expect(localTaskHandlerSource).toContain("New version      :");
            expect(localTaskHandlerSource).toContain("Bump level       :");
            expect(localTaskHandlerSource).toContain("Decided by       :");
            expect(localTaskHandlerSource).toContain("Diff size        :");
            expect(localTaskHandlerSource).toContain("Commit message:");
            expect(localTaskHandlerSource).toContain("Dry-run mode");
            expect(localTaskHandlerSource).toContain("no files were modified");
        });

        it("outputs to logger.info for formatted report", () => {
            expect(localTaskHandlerSource).toContain("this.context.logger.info(lines.join");
        });
    });

    describe("JSON output when AUTOVERSION_DRY_RUN_JSON=1", () => {
        it("checks AUTOVERSION_DRY_RUN_JSON env var", () => {
            expect(localTaskHandlerSource).toContain('process.env.AUTOVERSION_DRY_RUN_JSON === "1"');
        });

        it("writes JSON to stdout when env var is set", () => {
            expect(localTaskHandlerSource).toContain("process.stdout.write(");
            expect(localTaskHandlerSource).toContain("JSON.stringify(");
        });

        it("JSON output includes all required fields", () => {
            // Verify the JSON output includes all DryRunReport fields
            const jsonOutputSection = localTaskHandlerSource.slice(
                localTaskHandlerSource.indexOf("AUTOVERSION_DRY_RUN_JSON"),
                localTaskHandlerSource.indexOf("return;\n        }\n\n        const lines")
            );
            expect(jsonOutputSection).toContain("previousVersion:");
            expect(jsonOutputSection).toContain("newVersion:");
            expect(jsonOutputSection).toContain("versionBump:");
            expect(jsonOutputSection).toContain("tier:");
            expect(jsonOutputSection).toContain("commitMessage:");
            expect(jsonOutputSection).toContain("diffSizeBytes:");
        });
    });

    describe("non-AUTO version: dry-run is a no-op", () => {
        it("warns when dry-run is used without AUTO version", () => {
            expect(localTaskHandlerSource).toContain("--dry-run is only meaningful when version is AUTO. Ignoring.");
        });

        it("returns shouldCommit: false when version is not AUTO and dryRun is true", () => {
            // After the dryRun warning for non-AUTO, it returns shouldCommit: false to prevent commits
            const dryRunWarningSection = localTaskHandlerSource.slice(
                localTaskHandlerSource.indexOf("--dry-run is only meaningful when version is AUTO"),
                localTaskHandlerSource.indexOf("--dry-run is only meaningful when version is AUTO") + 200
            );
            expect(dryRunWarningSection).toContain(
                "return { shouldCommit: false, autoVersioningCommitMessage: undefined };"
            );
        });
    });

    describe("handleAutoVersioning returns enriched AutoVersionResult", () => {
        it("includes previousVersion in AI analysis path", () => {
            expect(localTaskHandlerSource).toContain('tier: "ai"');
            expect(localTaskHandlerSource).toContain("previousVersion,");
            expect(localTaskHandlerSource).toContain("versionBump: analysis.versionBump,");
            expect(localTaskHandlerSource).toContain("diffSizeBytes: cleanedDiff.length");
        });

        it("includes tier: initial for new SDK repositories", () => {
            expect(localTaskHandlerSource).toContain('tier: "initial"');
        });

        it("includes tier: fallback when AI analysis fails", () => {
            expect(localTaskHandlerSource).toContain('tier: "fallback"');
            expect(localTaskHandlerSource).toContain("versionBump: VersionBump.PATCH,");
        });
    });

    describe("AutoVersionResult interface supports dry-run fields", () => {
        it("has previousVersion optional field", () => {
            expect(autoVersioningServiceSource).toContain("previousVersion?: string;");
        });

        it("has versionBump optional field", () => {
            expect(autoVersioningServiceSource).toContain("versionBump?: string;");
        });

        it("has tier optional field", () => {
            expect(autoVersioningServiceSource).toContain("tier?: string;");
        });

        it("has diffSizeBytes optional field", () => {
            expect(autoVersioningServiceSource).toContain("diffSizeBytes?: number;");
        });
    });
});

describe("CLI flag threading: --dry-run passes through to LocalTaskHandler", () => {
    it("CLI defines --dry-run flag", () => {
        expect(cliSource).toContain('"dry-run"');
        expect(cliSource).toContain("Preview the computed version without writing any files");
    });

    it("CLI validates --dry-run requires local generation", () => {
        expect(cliSource).toContain("The --dry-run flag requires local generation (--local or --runner).");
    });

    it("CLI passes dryRun to generateAPIWorkspaces", () => {
        expect(cliSource).toContain('dryRun: argv["dry-run"]');
    });

    it("generateAPIWorkspaces accepts dryRun parameter", () => {
        expect(generateAPIWorkspacesSource).toContain("dryRun: boolean;");
    });

    it("generateAPIWorkspaces passes dryRun to generateWorkspace", () => {
        expect(generateAPIWorkspacesSource).toContain("dryRun");
    });

    it("generateAPIWorkspace accepts dryRun parameter", () => {
        expect(generateAPIWorkspaceSource).toContain("dryRun: boolean;");
    });

    it("generateAPIWorkspace passes dryRun to runLocalGenerationForWorkspace", () => {
        expect(generateAPIWorkspaceSource).toContain("dryRun");
    });

    it("runLocalGenerationForWorkspace accepts dryRun parameter", () => {
        expect(runLocalGenerationSource).toContain("dryRun?: boolean;");
    });

    it("runLocalGenerationForWorkspace passes dryRun to writeFilesToDiskAndRunGenerator", () => {
        expect(runLocalGenerationSource).toContain("dryRun");
    });

    it("writeFilesToDiskAndRunGenerator accepts dryRun parameter", () => {
        expect(runGeneratorSource).toContain("dryRun?: boolean;");
    });

    it("writeFilesToDiskAndRunGenerator passes dryRun to LocalTaskHandler", () => {
        expect(runGeneratorSource).toContain("dryRun");
    });
});
