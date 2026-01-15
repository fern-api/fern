import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseJavaCustomConfigSchema } from "@fern-api/java-ast";
import { loggingExeca } from "@fern-api/logging-execa";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { AbstractJavaGeneratorContext } from "../context/AbstractJavaGeneratorContext";

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

            this.context.logger.debug(`JavaProject: Running spotlessApply with JFR profiling`);

            // Generate timestamp for JFR filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const jfrFilename = `spotless-profile-${timestamp}.jfr`;
            const jfrPath = `/fern/output/${jfrFilename}`;

            // Configure JFR recording via GRADLE_OPTS
            const jfrOptions = [
                "-XX:+FlightRecorder",
                `-XX:StartFlightRecording=duration=300s,filename=${jfrPath},settings=profile`,
                "-XX:FlightRecorderOptions=stackdepth=256"
            ].join(" ");

            this.context.logger.debug(`JavaProject: JFR recording will be saved to ${jfrPath}`);

            await loggingExeca(this.context.logger, "./gradlew", [":spotlessApply"], {
                doNotPipeOutput: false,
                cwd: this.absolutePathToOutputDirectory,
                env: {
                    ...process.env,
                    GRADLE_OPTS: `${process.env.GRADLE_OPTS || ""} ${jfrOptions}`.trim()
                }
            });

            this.context.logger.debug(`JavaProject: Successfully ran spotlessApply - JFR profile saved to ${jfrPath}`);
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
