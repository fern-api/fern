import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { Argv } from "yargs";
import { FERN_YML_FILENAME } from "../../config/fern-yml/constants";
import { FernYmlBuilder } from "../../config/fern-yml/FernYmlBuilder";
import type { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { PETSTORE_OPENAPI_YML } from "../../init/templates/openapi.yml";
import { Wizard } from "../../init/Wizard";
import { Icons } from "../../ui/format";
import { command } from "../_internal/command";

export declare namespace InitCommand {
    export interface Args extends GlobalArgs {
        org?: string;
        api?: string;
        yes: boolean;
    }
}

const SPECS_DIR = "openapi";

export class InitCommand {
    public async handle(context: Context, args: InitCommand.Args): Promise<void> {
        const fernYmlPath = join(context.cwd, RelativeFilePath.of(FERN_YML_FILENAME));
        await this.validateArgs({ context, fernYmlPath, args });

        const wizard = new Wizard({ context, args });
        const result = await wizard.run();

        await this.writeFernYml({
            context,
            fernYmlPath,
            result
        });
        await this.writeApiSpec({ context, apiSource: result.apiSource });
        this.printNextSteps({ context, result });
    }

    private async writeFernYml({
        context,
        fernYmlPath,
        result
    }: {
        context: Context;
        fernYmlPath: AbsoluteFilePath;
        result: Wizard.Result;
    }): Promise<void> {
        const apiPath = this.resolveApiPath(result.apiSource);
        const specFormat = result.apiSource.type === "sample" ? "openapi" : result.apiSource.format;

        const writer = new FernYmlBuilder();
        const fernYmlContent = writer.build({
            organization: result.organization,
            languages: result.languages,
            outputs: result.outputs,
            specFormat,
            apiPath,
            defaultGroup: result.defaultGroup
        });

        await writeFile(fernYmlPath, fernYmlContent, "utf-8");
        context.stderr.info(`\n  ${Icons.success} Created ${FERN_YML_FILENAME}`);
    }

    private async writeApiSpec({
        context,
        apiSource
    }: {
        context: Context;
        apiSource: Wizard.ApiSource;
    }): Promise<void> {
        switch (apiSource.type) {
            case "file":
                // no-op; the file already exists on disk.
                return;
            case "url":
                await this.writeSpecFile(context.cwd, apiSource.filename, apiSource.content);
                context.stderr.info(`  ${Icons.success} Created ${SPECS_DIR}/${apiSource.filename}`);
                return;
            case "sample":
                await this.writeSpecFile(context.cwd, "openapi.yml", PETSTORE_OPENAPI_YML);
                context.stderr.info(`  ${Icons.success} Created ${SPECS_DIR}/openapi.yml`);
                return;
            default:
                assertNever(apiSource);
        }
    }

    private async writeSpecFile(cwd: AbsoluteFilePath, filename: string, content: string): Promise<void> {
        const specsDir = join(cwd, RelativeFilePath.of(SPECS_DIR));
        await mkdir(specsDir, { recursive: true });
        const filePath = join(specsDir, RelativeFilePath.of(filename));
        await writeFile(filePath, content, "utf-8");
    }

    private resolveApiPath(apiSource: Wizard.ApiSource): string {
        switch (apiSource.type) {
            case "file":
                return apiSource.path;
            case "url":
                return `./${SPECS_DIR}/${apiSource.filename}`;
            case "sample":
                return `./${SPECS_DIR}/openapi.yml`;
            default:
                assertNever(apiSource);
        }
    }

    private printNextSteps({ context, result }: { context: Context; result: Wizard.Result }): void {
        context.stderr.info(`\n  ${Icons.success} ${chalk.bold("Your Fern project is ready!")}`);
        context.stderr.info(`\n  ${chalk.bold("Next steps:")}`);

        context.stderr.info(`    1. Validate your API definition:`);
        context.stderr.info(chalk.cyan(`       fern check`));

        const firstLang = result.languages[0];
        if (result.languages.length === 1 && firstLang != null) {
            context.stderr.info(`    2. Generate your SDK:`);
            context.stderr.info(chalk.cyan(`       fern sdk generate --target ${firstLang}`));
        } else {
            context.stderr.info(`    2. Generate your SDKs:`);
            context.stderr.info(chalk.cyan(`       fern sdk generate`));
        }

        context.stderr.info(`    3. Learn more:`);
        context.stderr.info(chalk.cyan(`       https://buildwithfern.com/learn`));
    }

    private async validateArgs({
        context,
        fernYmlPath,
        args
    }: {
        context: Context;
        fernYmlPath: AbsoluteFilePath;
        args: InitCommand.Args;
    }): Promise<void> {
        if (await doesPathExist(fernYmlPath)) {
            throw new CliError({
                message: `A ${FERN_YML_FILENAME} file already exists at ${fernYmlPath}`,
                code: CliError.Code.ConfigError
            });
        }
        if (args.api != null) {
            const api = args.api;
            if (!api.startsWith("http://") && !api.startsWith("https://")) {
                const resolved = path.resolve(context.cwd, api);
                if (!(await doesPathExist(AbsoluteFilePath.of(resolved)))) {
                    throw new CliError({ message: `File not found: ${api}`, code: CliError.Code.ConfigError });
                }
            }
        }
        if (!context.isTTY && !args.yes) {
            throw new CliError({
                message: "Cannot run interactive init in non-TTY environment. Use --yes for defaults.",
                code: CliError.Code.ConfigError
            });
        }
    }
}

export function addInitCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new InitCommand();
    command(
        cli,
        "init",
        "Initialize a new Fern project",
        (context, args) => cmd.handle(context, args as InitCommand.Args),
        (yargs) =>
            yargs
                .option("org", {
                    type: "string",
                    description: "Organization name (skips organization prompt)"
                })
                .option("api", {
                    type: "string",
                    description: "Path or URL to an API spec (skips API source prompt)"
                })
                .option("yes", {
                    type: "boolean",
                    description: "Accept all defaults (non-interactive mode)",
                    default: false
                })
    );
}
