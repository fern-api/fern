import { loggingExeca } from "@fern-api/logging-execa";
import { copyFile, rm } from "fs/promises";

import { ExecutionEnvironment } from "./ExecutionEnvironment.js";

const LICENSE_MOUNT_PATH = "/tmp/LICENSE";

/**
 * Executes generators natively on the host system using provided commands.
 */
export class NativeExecutionEnvironment implements ExecutionEnvironment {
    public readonly usesContainerPaths = false;
    private readonly commands: string[];
    private readonly workingDirectory?: string;
    private readonly env?: Record<string, string>;
    constructor({
        commands,
        workingDirectory,
        env
    }: {
        commands: string[];
        workingDirectory?: string;
        env?: Record<string, string>;
    }) {
        this.commands = commands;
        this.workingDirectory = workingDirectory;
        this.env = env;
    }

    public async execute({
        generatorName,
        irPath,
        configPath,
        outputPath,
        snippetPath,
        snippetTemplatePath,
        licenseFilePath,
        context,
        inspect
    }: ExecutionEnvironment.ExecuteArgs): Promise<void> {
        context.logger.info(
            `Executing generator ${generatorName} natively with commands: ${this.commands.join(" && ")}`
        );

        // Copy license file to /tmp/LICENSE to match the Docker mount path that generators expect
        let copiedLicense = false;
        if (licenseFilePath != null) {
            try {
                await copyFile(licenseFilePath, LICENSE_MOUNT_PATH);
                copiedLicense = true;
                context.logger.debug(`Copied license file from ${licenseFilePath} to ${LICENSE_MOUNT_PATH}`);
            } catch (e) {
                context.logger.warn(
                    `Failed to copy license file from ${licenseFilePath} to ${LICENSE_MOUNT_PATH}: ${e}`
                );
            }
        }

        try {
            for (const command of this.commands) {
                const processedCommand = command
                    .replace("{IR_PATH}", irPath)
                    .replace("{CONFIG_PATH}", configPath)
                    .replace("{OUTPUT_PATH}", outputPath)
                    .replace("{SNIPPET_PATH}", snippetPath || "")
                    .replace("{SNIPPET_TEMPLATE_PATH}", snippetTemplatePath || "")
                    .replace("{GENERATOR_NAME}", generatorName);

                context.logger.debug(`Executing command: ${processedCommand}`);

                // Check if command contains shell operators that require shell mode
                const shellOperators = ["&&", "||", "|", ";", ">", "<", ">>", "<<"];
                const needsShell = shellOperators.some((op) => processedCommand.includes(op));

                const execOptions = {
                    doNotPipeOutput: false,
                    reject: false,
                    cwd: this.workingDirectory,
                    env: {
                        ...process.env,
                        ...this.env,
                        IR_PATH: irPath,
                        CONFIG_PATH: configPath,
                        OUTPUT_PATH: outputPath,
                        SNIPPET_PATH: snippetPath || "",
                        SNIPPET_TEMPLATE_PATH: snippetTemplatePath || "",
                        GENERATOR_NAME: generatorName,
                        ...(inspect ? { NODE_OPTIONS: "--inspect-brk=0.0.0.0:9229" } : {})
                    },
                    shell: needsShell
                };

                let result;
                if (needsShell) {
                    // For shell commands, pass the entire command as a single string
                    result = await loggingExeca(context.logger, processedCommand, [], execOptions);
                } else {
                    // For simple commands, split by space
                    const parts = processedCommand.split(" ");
                    const program = parts[0];
                    const args = parts.slice(1);

                    if (!program) {
                        throw new Error(`Invalid command: ${processedCommand}`);
                    }

                    result = await loggingExeca(context.logger, program, args, execOptions);
                }

                if (result.failed) {
                    throw new Error(`Command failed: ${processedCommand}\n${result.stderr || result.stdout}`);
                }
            }
        } finally {
            // Clean up the copied license file
            if (copiedLicense) {
                try {
                    await rm(LICENSE_MOUNT_PATH, { force: true });
                } catch (e) {
                    context.logger.debug(`Best-effort cleanup of ${LICENSE_MOUNT_PATH} failed: ${e}`);
                }
            }
        }

        context.logger.info("Native generator execution completed successfully");
    }
}
