import { AbstractProject, File } from "@fern-api/base-generator";
import { FERN_JAVA_SKIP_FORMATTING_ENV_VAR, isEnvVarTruthy } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseJavaCustomConfigSchema } from "@fern-api/java-ast";
import { loggingExeca } from "@fern-api/logging-execa";
import { cp, mkdir, writeFile } from "fs/promises";
import path from "path";
import { AbstractJavaGeneratorContext } from "../context/AbstractJavaGeneratorContext.js";

const GRADLE_DOWNLOAD_ATTEMPTS = 3;
const GRADLE_DOWNLOAD_RETRY_DELAY_MS = 2_000;

/**
 * The wrapper's downloader is `org.gradle.wrapper.Install`, and it reports a failed fetch as an
 * uncaught exception naming that class before any build work happens.
 */
function isGradleDistributionDownloadFailure(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }
    const stderr = "stderr" in error && typeof error.stderr === "string" ? error.stderr : "";
    const output = `${error.message}\n${stderr}`;
    return output.includes("org.gradle.wrapper.Install") || output.includes("org.gradle.wrapper.GradleWrapperMain");
}

/**
 * In memory representation of a Java project.
 */
export class JavaProject extends AbstractProject<AbstractJavaGeneratorContext<BaseJavaCustomConfigSchema>> {
    private sourceFiles: File[] = [];

    public constructor({ context }: { context: AbstractJavaGeneratorContext<BaseJavaCustomConfigSchema> }) {
        super(context);
    }

    public addJavaFiles(file: File): void {
        const filepath = file.directory.length > 0 ? `${file.directory}/${file.filename}` : file.filename;
        this.context.logger.debug(`Generating ${filepath}`);
        this.sourceFiles.push(file);
    }

    public override addRawFiles(file: File): void {
        const filepath = file.directory.length > 0 ? `${file.directory}/${file.filename}` : file.filename;
        this.context.logger.debug(`Generating ${filepath}`);
        super.addRawFiles(file);
    }

    public async persist(): Promise<void> {
        this.context.logger.debug(`Writing java files to ${this.absolutePathToOutputDirectory}`);
        await this.writeJavaFiles({
            absolutePathToDirectory: this.absolutePathToOutputDirectory,
            files: this.sourceFiles
        });
        await this.writeRawFiles();
        this.context.logger.debug(`Successfully wrote java files to ${this.absolutePathToOutputDirectory}`);
        const gradlewPath = join(this.absolutePathToOutputDirectory, RelativeFilePath.of("gradlew"));
        const gradlewExists = await doesPathExist(gradlewPath, "file");
        if (gradlewExists) {
            // Apply gradle-distribution-url override if configured
            await this.applyGradleDistributionUrlOverride();

            const skipFormattingValue = process.env[FERN_JAVA_SKIP_FORMATTING_ENV_VAR];
            if (isEnvVarTruthy(skipFormattingValue)) {
                this.context.logger.info(
                    `JavaProject: ${FERN_JAVA_SKIP_FORMATTING_ENV_VAR}=${skipFormattingValue} — skipping spotlessApply. ` +
                        "No Gradle command will run during generation. Generated code is unformatted; " +
                        "run ./gradlew spotlessApply yourself to format it."
                );
                return;
            }
            if (skipFormattingValue != null) {
                this.context.logger.info(
                    `JavaProject: ${FERN_JAVA_SKIP_FORMATTING_ENV_VAR}=${skipFormattingValue} is not a truthy value ` +
                        '("1", "true", "yes", "on"), so formatting will still run.'
                );
            }

            const enableProfiling = this.context.customConfig["enable-gradle-profiling"] === true;
            const gradleArgs = [":spotlessApply"];
            if (enableProfiling) {
                gradleArgs.push("--profile");
                this.context.logger.info(`JavaProject: Running spotlessApply with profiling enabled`);
            } else {
                this.context.logger.info(
                    `JavaProject: Running spotlessApply. Set ${FERN_JAVA_SKIP_FORMATTING_ENV_VAR}=true to skip it.`
                );
            }
            await this.runGradle(gradleArgs);
            this.context.logger.debug(`JavaProject: Successfully ran spotlessApply`);
            if (enableProfiling) {
                // Copy build/reports/ to reports/ at the root so it's not gitignored
                const buildReportsPath = join(this.absolutePathToOutputDirectory, RelativeFilePath.of("build/reports"));
                const reportsPath = join(this.absolutePathToOutputDirectory, RelativeFilePath.of("reports"));
                const buildReportsExists = await doesPathExist(buildReportsPath, "directory");
                if (buildReportsExists) {
                    await cp(buildReportsPath, reportsPath, { recursive: true });
                    this.context.logger.info(`JavaProject: Gradle profiling report copied to reports/`);
                } else {
                    this.context.logger.info(`JavaProject: No profiling report found in build/reports/`);
                }
            }
        }
    }

    /**
     * Runs the wrapper, retrying while it fails fetching the Gradle distribution it needs. The
     * wrapper downloads the distribution on its first run and gives up on the first network error.
     */
    private async runGradle(gradleArgs: string[]): Promise<void> {
        for (let attempt = 1; ; attempt++) {
            try {
                await loggingExeca(this.context.logger, "./gradlew", gradleArgs, {
                    doNotPipeOutput: false,
                    cwd: this.absolutePathToOutputDirectory
                });
                return;
            } catch (error) {
                if (attempt >= GRADLE_DOWNLOAD_ATTEMPTS || !isGradleDistributionDownloadFailure(error)) {
                    throw error;
                }
                this.context.logger.warn(
                    `JavaProject: the Gradle wrapper failed to download its distribution ` +
                        `(attempt ${attempt} of ${GRADLE_DOWNLOAD_ATTEMPTS}); retrying.`
                );
                await new Promise((resolve) => setTimeout(resolve, GRADLE_DOWNLOAD_RETRY_DELAY_MS * attempt));
            }
        }
    }

    private async writeJavaFiles({
        absolutePathToDirectory,
        files
    }: {
        absolutePathToDirectory: AbsoluteFilePath;
        files: File[];
    }): Promise<AbsoluteFilePath> {
        await this.mkdir(absolutePathToDirectory);
        await Promise.all(files.map(async (file) => await file.write(absolutePathToDirectory)));
        return absolutePathToDirectory;
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`);
        await mkdir(absolutePathToDirectory, { recursive: true });
    }

    /**
     * Apply gradle-distribution-url override if configured.
     * This ensures the Gradle wrapper uses the custom distribution URL
     * when downloading Gradle, which is essential for enterprise networks
     * that cannot access services.gradle.org.
     */
    private async applyGradleDistributionUrlOverride(): Promise<void> {
        const customUrl = this.context.customConfig["gradle-distribution-url"];
        this.context.logger.info(`JavaProject: gradle-distribution-url value: ${customUrl ?? "not configured"}`);

        if (customUrl == null) {
            this.context.logger.info(`JavaProject: No gradle-distribution-url configured, using default`);
            return;
        }

        this.context.logger.info(`JavaProject: Applying gradle-distribution-url override: ${customUrl}`);

        const wrapperPropertiesPath = join(
            this.absolutePathToOutputDirectory,
            RelativeFilePath.of("gradle/wrapper/gradle-wrapper.properties")
        );

        // Ensure the gradle/wrapper directory exists
        const wrapperDir = path.dirname(wrapperPropertiesPath);
        await mkdir(wrapperDir, { recursive: true });

        // Escape colons in the URL as required by Java properties file format
        const escapedUrl = customUrl.replace(/:/g, "\\:");

        const propertiesContent = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=${escapedUrl}
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;

        await writeFile(wrapperPropertiesPath, propertiesContent);
        this.context.logger.info(
            `JavaProject: Successfully wrote custom gradle-wrapper.properties to ${wrapperPropertiesPath}`
        );
    }
}
