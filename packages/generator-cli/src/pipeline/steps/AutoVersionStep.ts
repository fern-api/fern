import type { configureBamlClient as ConfigureBamlClient, VersionBump as VersionBumpEnum } from "@fern-api/cli-ai";
import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import {
    AutoVersioningException,
    AutoVersioningService,
    countFilesInDiff,
    formatSizeKB,
    incrementVersion,
    isValidSemver,
    MAGIC_VERSION,
    MAX_AI_DIFF_BYTES,
    MAX_CHUNKS,
    MAX_RAW_DIFF_BYTES,
    mapMagicVersionForLanguage,
    maxVersionBump
} from "../../autoversion/index";
import type { PreparedReplay } from "../../replay/replay-run";
import type { PipelineLogger } from "../PipelineLogger";
import type { AutoVersionStepConfig, AutoVersionStepResult, PipelineContext } from "../types";
import { BaseStep } from "./BaseStep";

const COMMIT_MARKER = "[fern-autoversion]";
const FERN_TRAILER = "\n\n🌿 Generated with Fern";

type VersionBumpLabel = "MAJOR" | "MINOR" | "PATCH" | "NO_CHANGE";

/**
 * Runs SDK autoversioning inside the replay pipeline, between the `[fern-generated]`
 * commit (produced by GenerationCommitStep) and replay detect/apply (ReplayStep).
 * Diffs prev vs new `[fern-generated]` SHAs — both pure generator output, no replay
 * customizations on either side — calls FAI to determine the semver bump and a
 * user-facing changelog entry, rewrites the placeholder version across the working
 * tree, prepends the entry to `changelog.md`, and commits `[fern-autoversion]` on top
 * of the generation commit.
 *
 * Short-circuits when:
 *  - GenerationCommitStep did not produce a PreparedReplay handle (replay uninitialized).
 *  - Replay's selected flow is `skip-application`.
 *  - The prev-vs-current diff is empty (no generator output changed).
 *  - FAI returns NO_CHANGE.
 *
 * Falls back to a PATCH bump with a neutral commit message when:
 *  - The cleaned diff exceeds MAX_RAW_DIFF_BYTES.
 *  - The FAI call throws (network error, rate limit, malformed response, …).
 */
export class AutoVersionStep extends BaseStep {
    readonly name = "autoVersion";

    constructor(
        outputDir: string,
        logger: PipelineLogger,
        private readonly config: AutoVersionStepConfig
    ) {
        super(outputDir, logger);
    }

    async execute(context: PipelineContext): Promise<AutoVersionStepResult> {
        const prepared = context.previousStepResults.generationCommit?.preparedReplay;

        if (!prepared) {
            this.logger.info(
                "AutoVersionStep: no replay preparation available (replay uninitialized or prepare failed); skipping."
            );
            return { executed: true, success: true };
        }

        if (prepared.flow === "skip-application") {
            this.logger.info("AutoVersionStep: replay flow is skip-application; skipping autoversion.");
            return { executed: true, success: true };
        }

        const language = this.config.language;
        const mappedMagicVersion = mapMagicVersionForLanguage(MAGIC_VERSION, language);
        const service = new AutoVersioningService({ logger: this.toTaskLogger() });

        if (prepared.previousGenerationSha == null) {
            return await this.handleFirstGeneration({ service, language, mappedMagicVersion });
        }

        return await this.handleNormalFlow({
            prepared,
            service,
            language,
            mappedMagicVersion,
            previousGenerationSha: prepared.previousGenerationSha
        });
    }

    private async handleFirstGeneration(params: {
        service: AutoVersioningService;
        language: string;
        mappedMagicVersion: string;
    }): Promise<AutoVersionStepResult> {
        const { service, language, mappedMagicVersion } = params;
        const initialVersion = this.config.baseVersion ?? (mappedMagicVersion.startsWith("v") ? "v0.0.1" : "0.0.1");

        // `initialVersion` flows into `AutoVersioningService.replaceMagicVersion`, which
        // runs `bash -c` with the value embedded in a single-quoted sed expression. A
        // stray single quote or shell metacharacter would escape quoting and execute
        // arbitrary code on the generation host. `baseVersion` is user-supplied config,
        // so validate it against the same strict semver regex `incrementVersion` uses
        // before letting it reach the shell. The two hardcoded defaults are safe.
        if (!isValidSemver(initialVersion)) {
            const errorMessage =
                `AutoVersionStep: baseVersion ${JSON.stringify(initialVersion)} is not a valid semver ` +
                `string (expected e.g. "1.2.3" or "v1.2.3"). Refusing to run to avoid shell injection ` +
                `into the placeholder-rewrite step.`;
            this.logger.error(errorMessage);
            return {
                executed: true,
                success: false,
                errorMessage
            };
        }

        this.logger.info(`AutoVersionStep: first generation — using initial version ${initialVersion}`);

        await service.replaceMagicVersion(this.outputDir, mappedMagicVersion, initialVersion);
        if (language === "go") {
            await service.addGoMajorVersionSuffix(this.outputDir, initialVersion);
        }

        const commitMessage = this.brandMessage("Initial SDK generation");
        const commitSha = this.commitAutoversion(commitMessage);

        return {
            executed: true,
            success: true,
            version: initialVersion,
            commitMessage,
            commitSha
        };
    }

    private async handleNormalFlow(params: {
        prepared: PreparedReplay;
        service: AutoVersioningService;
        language: string;
        mappedMagicVersion: string;
        previousGenerationSha: string;
    }): Promise<AutoVersionStepResult> {
        const { prepared, service, language, mappedMagicVersion, previousGenerationSha } = params;

        const rawDiff = this.gitDiff(previousGenerationSha, prepared.currentGenerationSha);

        const previousVersion = await this.resolvePreviousVersion({ service, rawDiff, mappedMagicVersion });
        if (previousVersion == null) {
            return await this.handleFirstGeneration({ service, language, mappedMagicVersion });
        }

        // Even when the two [fern-generated] trees are byte-identical, the
        // current working tree still has the placeholder from this run's
        // generator output. We must rewrite it to `previousVersion` before
        // exiting or the SDK ships with `0.0.0-fern-placeholder` baked into
        // its manifests and user-agent strings.
        if (rawDiff.trim().length === 0) {
            this.logger.info(
                `AutoVersionStep: empty diff between generations; rewriting placeholder to ${previousVersion}.`
            );
            return await this.finalizeNoChange({
                service,
                language,
                mappedMagicVersion,
                previousVersion,
                reason: "no diff between generations"
            });
        }

        const cleanedDiff = service.cleanDiffForAI(rawDiff, mappedMagicVersion);
        const rawBytes = Buffer.byteLength(rawDiff, "utf-8");
        const cleanedBytes = Buffer.byteLength(cleanedDiff, "utf-8");
        this.logger.debug(
            `AutoVersionStep: raw=${formatSizeKB(rawBytes)}KB (${countFilesInDiff(rawDiff)} files), ` +
                `cleaned=${formatSizeKB(cleanedBytes)}KB (${countFilesInDiff(cleanedDiff)} files)`
        );

        if (cleanedDiff.trim().length === 0) {
            this.logger.info(
                `AutoVersionStep: cleaned diff is empty; no semantic changes — rewriting placeholder to ${previousVersion}.`
            );
            return await this.finalizeNoChange({
                service,
                language,
                mappedMagicVersion,
                previousVersion,
                reason: "no semantic changes"
            });
        }

        if (cleanedBytes > MAX_RAW_DIFF_BYTES) {
            this.logger.warn(
                `AutoVersionStep: diff too large for FAI (${formatSizeKB(cleanedBytes)}KB, ` +
                    `limit ${formatSizeKB(MAX_RAW_DIFF_BYTES)}KB). Falling back to PATCH.`
            );
            return await this.finalizeWithBump({
                service,
                language,
                mappedMagicVersion,
                previousVersion,
                analysis: { versionBump: "PATCH", message: this.brandMessage("SDK regeneration") }
            });
        }

        const chunks = service.chunkDiff(cleanedDiff, MAX_AI_DIFF_BYTES);
        const cappedChunks = chunks.slice(0, MAX_CHUNKS);
        const skippedChunks = chunks.length - cappedChunks.length;
        if (chunks.length > 1) {
            this.logger.info(
                `AutoVersionStep: split diff into ${chunks.length} chunks` +
                    (skippedChunks > 0 ? ` (capped at ${MAX_CHUNKS}, skipping ${skippedChunks})` : "")
            );
        }

        let analysis: FAIAnalysis | null;
        try {
            analysis =
                cappedChunks.length <= 1
                    ? await this.analyzeSingle(cleanedDiff, language, previousVersion)
                    : await this.analyzeChunks(cappedChunks, language, previousVersion);
        } catch (error) {
            this.logger.warn(`AutoVersionStep: FAI analysis failed (${String(error)}); falling back to PATCH bump.`);
            analysis = { versionBump: "PATCH", message: this.brandMessage("SDK regeneration") };
        }

        if (analysis == null) {
            this.logger.info(`AutoVersionStep: FAI returned NO_CHANGE; rewriting placeholder to ${previousVersion}.`);
            return await this.finalizeNoChange({
                service,
                language,
                mappedMagicVersion,
                previousVersion,
                reason: "FAI returned NO_CHANGE"
            });
        }

        return await this.finalizeWithBump({
            service,
            language,
            mappedMagicVersion,
            previousVersion,
            analysis
        });
    }

    /**
     * Terminal path for runs that determine no semver bump is needed. The
     * current working tree still contains `0.0.0-fern-placeholder` from this
     * run's generator output, so we must rewrite it to `previousVersion`
     * before exiting — otherwise the SDK ships with the placeholder embedded
     * in manifests (package.json, pyproject.toml, .fern/metadata.json) and
     * user-agent strings (e.g. `X-Fern-SDK-Version`). Commits the rewrite as
     * `[fern-autoversion]` so the replay + github steps see a stable base.
     */
    private async finalizeNoChange(params: {
        service: AutoVersioningService;
        language: string;
        mappedMagicVersion: string;
        previousVersion: string;
        reason: string;
    }): Promise<AutoVersionStepResult> {
        const { service, language, mappedMagicVersion, previousVersion, reason } = params;

        // `previousVersion` flows into the same `bash -c` + single-quoted sed
        // expression that `handleFirstGeneration` guards against with
        // `isValidSemver`. Extraction (regex), metadata.json, and git tags
        // are all user-influenced surfaces — reject anything that isn't a
        // clean semver rather than let it escape shell quoting.
        if (!isValidSemver(previousVersion)) {
            const errorMessage =
                `AutoVersionStep: resolved previousVersion ${JSON.stringify(previousVersion)} is not a ` +
                `valid semver string. Refusing to rewrite placeholder to avoid shell injection.`;
            this.logger.error(errorMessage);
            return { executed: true, success: false, errorMessage };
        }

        await service.replaceMagicVersion(this.outputDir, mappedMagicVersion, previousVersion);
        if (language === "go") {
            await service.addGoMajorVersionSuffix(this.outputDir, previousVersion);
        }

        const commitMessage = this.brandMessage(`SDK regeneration (no semver change: ${reason})`);
        const commitSha = this.commitAutoversion(commitMessage);

        return {
            executed: true,
            success: true,
            version: previousVersion,
            previousVersion,
            versionBump: "NO_CHANGE",
            commitMessage,
            commitSha
        };
    }

    private async finalizeWithBump(params: {
        service: AutoVersioningService;
        language: string;
        mappedMagicVersion: string;
        previousVersion: string;
        analysis: FAIAnalysis;
    }): Promise<AutoVersionStepResult> {
        const { service, language, mappedMagicVersion, previousVersion, analysis } = params;

        const newVersion = incrementVersion(previousVersion, analysis.versionBump as VersionBumpEnum);
        this.logger.info(`AutoVersionStep: ${analysis.versionBump} bump: ${previousVersion} → ${newVersion}`);

        await service.replaceMagicVersion(this.outputDir, mappedMagicVersion, newVersion);
        if (language === "go") {
            await service.addGoMajorVersionSuffix(this.outputDir, newVersion);
        }

        if (analysis.changelogEntry && analysis.changelogEntry.trim().length > 0) {
            await this.prependChangelogEntry({ version: newVersion, entry: analysis.changelogEntry });
        }

        const commitSha = this.commitAutoversion(analysis.message);

        return {
            executed: true,
            success: true,
            version: newVersion,
            commitMessage: analysis.message,
            changelogEntry: analysis.changelogEntry,
            previousVersion,
            versionBump: analysis.versionBump as VersionBumpLabel,
            prDescription: analysis.prDescription,
            versionBumpReason: analysis.versionBumpReason,
            commitSha
        };
    }

    private async resolvePreviousVersion(params: {
        service: AutoVersioningService;
        rawDiff: string;
        mappedMagicVersion: string;
    }): Promise<string | null> {
        const { service, rawDiff, mappedMagicVersion } = params;
        try {
            const extracted = service.extractPreviousVersion(rawDiff, mappedMagicVersion);
            if (extracted != null) {
                this.logger.debug(`AutoVersionStep: previous version from diff: ${extracted}`);
                return extracted;
            }
        } catch (error) {
            if (!(error instanceof AutoVersioningException) || !error.magicVersionAbsent) {
                throw error;
            }
            this.logger.info("AutoVersionStep: magic version not found in diff; falling back to metadata + git tags.");
        }

        const metadataVersion = await this.readVersionFromMetadata();
        if (metadataVersion != null) {
            return this.normalizeVersionPrefix(metadataVersion, mappedMagicVersion);
        }

        try {
            const tagVersion = await service.getLatestVersionFromGitTags(this.outputDir);
            if (tagVersion != null) {
                return this.normalizeVersionPrefix(tagVersion, mappedMagicVersion);
            }
        } catch (error) {
            this.logger.debug(`AutoVersionStep: git-tags fallback failed (${String(error)}); ignoring.`);
        }

        return null;
    }

    private async readVersionFromMetadata(): Promise<string | undefined> {
        try {
            const output = execFileSync("git", ["show", "HEAD~1:.fern/metadata.json"], {
                cwd: this.outputDir,
                encoding: "utf-8",
                stdio: "pipe"
            });
            const parsed = JSON.parse(output) as { sdkVersion?: string };
            return parsed.sdkVersion ?? undefined;
        } catch {
            return undefined;
        }
    }

    private normalizeVersionPrefix(version: string, mappedMagicVersion: string): string {
        const stripped = version.startsWith("v") ? version.slice(1) : version;
        return mappedMagicVersion.startsWith("v") ? `v${stripped}` : stripped;
    }

    private gitDiff(from: string, to: string): string {
        return execFileSync("git", ["diff", from, to, "--", ".", ":(exclude).fern/metadata.json"], {
            cwd: this.outputDir,
            encoding: "utf-8",
            stdio: "pipe",
            maxBuffer: 256 * 1024 * 1024
        });
    }

    private commitAutoversion(message: string): string {
        const subject = message.split("\n")[0] ?? message;
        const body = message.slice(subject.length).trimStart();
        const fullMessage = body.length > 0 ? `${COMMIT_MARKER} ${subject}\n\n${body}` : `${COMMIT_MARKER} ${subject}`;
        execFileSync("git", ["add", "-A"], { cwd: this.outputDir, stdio: "pipe" });
        execFileSync("git", ["commit", "--allow-empty", "-m", fullMessage], {
            cwd: this.outputDir,
            stdio: "pipe"
        });
        return execFileSync("git", ["rev-parse", "HEAD"], {
            cwd: this.outputDir,
            encoding: "utf-8",
            stdio: "pipe"
        }).trim();
    }

    private async prependChangelogEntry(params: { version: string; entry: string }): Promise<void> {
        const { version, entry } = params;
        const changelogPath = join(this.outputDir, "changelog.md");
        const now = new Date().toISOString().slice(0, 10);
        const header = `## [${version}] - ${now}\n`;
        const newBlock = `${header}${entry.trim()}\n\n`;

        let existing = "";
        if (existsSync(changelogPath)) {
            existing = await readFile(changelogPath, "utf-8");
        }

        let output: string;
        if (existing.trim().length === 0) {
            output = `# Changelog\n\n${newBlock}`;
        } else if (existing.startsWith("# Changelog")) {
            const newlineIdx = existing.indexOf("\n");
            const headerLine = newlineIdx >= 0 ? existing.slice(0, newlineIdx) : existing;
            const remainder = (newlineIdx >= 0 ? existing.slice(newlineIdx + 1) : "").replace(/^\s*\n/, "");
            output = `${headerLine}\n\n${newBlock}${remainder}`;
        } else {
            output = `${newBlock}${existing}`;
        }

        await writeFile(changelogPath, output, "utf-8");
    }

    private brandMessage(message: string): string {
        if (this.config.isWhitelabel) {
            return message;
        }
        if (message.includes("🌿 Generated with Fern")) {
            return message;
        }
        return `${message.trimEnd()}${FERN_TRAILER}`;
    }

    private async analyzeSingle(
        cleanedDiff: string,
        language: string,
        previousVersion: string
    ): Promise<FAIAnalysis | null> {
        const { client, VersionBump } = await this.loadBaml();
        const result = await client.AnalyzeSdkDiff(
            cleanedDiff,
            language,
            previousVersion,
            this.config.priorChangelog ?? "",
            this.config.specCommitMessage ?? ""
        );
        if (result.version_bump === VersionBump.NO_CHANGE) {
            return null;
        }
        return {
            versionBump: result.version_bump,
            message: result.message,
            changelogEntry: result.changelog_entry || undefined,
            versionBumpReason: result.version_bump_reason || undefined
        };
    }

    private async analyzeChunks(
        chunks: string[],
        language: string,
        previousVersion: string
    ): Promise<FAIAnalysis | null> {
        const { client, VersionBump } = await this.loadBaml();

        let bestBump: string = VersionBump.NO_CHANGE;
        let bestMessage = "";
        let bestVersionBumpReason: string | undefined;
        const changelogEntries: string[] = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (!chunk) {
                continue;
            }
            const analysis = await client.AnalyzeSdkDiff(
                chunk,
                language,
                previousVersion,
                this.config.priorChangelog ?? "",
                this.config.specCommitMessage ?? ""
            );
            if (analysis.version_bump === VersionBump.NO_CHANGE) {
                continue;
            }
            const prev = bestBump;
            bestBump = maxVersionBump(bestBump, analysis.version_bump);
            if (bestBump !== prev) {
                bestMessage = analysis.message;
                bestVersionBumpReason = analysis.version_bump_reason;
            }
            const entry = analysis.changelog_entry?.trim();
            if (entry) {
                changelogEntries.push(entry);
            }
        }

        if (bestBump === VersionBump.NO_CHANGE) {
            return null;
        }

        if (changelogEntries.length <= 1) {
            return {
                versionBump: bestBump,
                message: bestMessage,
                changelogEntry: changelogEntries[0],
                versionBumpReason: bestVersionBumpReason
            };
        }

        // Consolidate repetitive multi-chunk entries via the AI rollup.
        try {
            const consolidated = await client.ConsolidateChangelog(
                changelogEntries.join("\n\n"),
                bestBump,
                language,
                previousVersion,
                incrementVersion(previousVersion, bestBump as VersionBumpEnum)
            );
            return {
                versionBump: bestBump,
                message: bestMessage,
                changelogEntry: consolidated.consolidated_changelog,
                prDescription: consolidated.pr_description || undefined,
                versionBumpReason: consolidated.version_bump_reason || bestVersionBumpReason
            };
        } catch (error) {
            this.logger.warn(`AutoVersionStep: ConsolidateChangelog failed (${String(error)}); using joined entries.`);
            return {
                versionBump: bestBump,
                message: bestMessage,
                changelogEntry: changelogEntries.join("\n\n"),
                versionBumpReason: bestVersionBumpReason
            };
        }
    }

    /**
     * Dynamically imports @fern-api/cli-ai only when autoversion actually needs to
     * call FAI. The package is ESM-only with extensionless internal imports, so
     * unbundled CJS consumers (like generator-cli's `bin/cli` used by the README /
     * reference commands) would fail at load time with a static import — but those
     * commands never reach this method, so dynamic import keeps them unaffected.
     */
    private async loadBaml(): Promise<{
        client: ReturnType<typeof import("@fern-api/cli-ai").b.withOptions>;
        VersionBump: typeof import("@fern-api/cli-ai").VersionBump;
    }> {
        if (this.config.ai == null) {
            throw new Error("AutoVersionStep: ai config is missing. Set autoVersion.ai to a BAML provider+model pair.");
        }
        const cliAi = await import("@fern-api/cli-ai");
        const registry = cliAi.configureBamlClient(this.config.ai as Parameters<typeof ConfigureBamlClient>[0]);
        return {
            client: cliAi.b.withOptions({ clientRegistry: registry }),
            VersionBump: cliAi.VersionBump
        };
    }

    /**
     * AutoVersioningService was built against the CLI's TaskContext logger — a richer
     * shape with `trace`, `log`, `enable`, `disable`. Our pipeline only has the four
     * core levels; stub the rest as no-ops and adapt the method signatures. Cast to
     * the service's expected Logger type because the surface is structurally wider
     * than what PipelineLogger exposes.
     */
    private toTaskLogger(): ConstructorParameters<typeof AutoVersioningService>[0]["logger"] {
        const noop = () => undefined;
        const adapter = {
            debug: (msg: string) => this.logger.debug(msg),
            info: (msg: string) => this.logger.info(msg),
            warn: (msg: string) => this.logger.warn(msg),
            error: (msg: string) => this.logger.error(msg),
            trace: (msg: string) => this.logger.debug(msg),
            log: (msg: string) => this.logger.info(msg),
            enable: noop,
            disable: noop
        };
        return adapter as unknown as ConstructorParameters<typeof AutoVersioningService>[0]["logger"];
    }
}

interface FAIAnalysis {
    versionBump: string;
    message: string;
    changelogEntry?: string;
    prDescription?: string;
    versionBumpReason?: string;
}
