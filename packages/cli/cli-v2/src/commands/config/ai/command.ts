import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import type { Argv } from "yargs";
import { AiCredentialStore } from "../../../auth/AiCredentialStore.js";
import { FernRcSchemaLoader } from "../../../config/fern-rc/FernRcSchemaLoader.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { command } from "../../_internal/command.js";
import { commandGroup } from "../../_internal/commandGroup.js";

const PROVIDERS = ["anthropic", "openai", "bedrock"] as const;
type Provider = (typeof PROVIDERS)[number];

function isProvider(value: string): value is Provider {
    return (PROVIDERS as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// fern config ai set-provider
// ---------------------------------------------------------------------------

export declare namespace AiSetProviderCommand {
    export interface Args extends GlobalArgs {
        provider: string;
    }
}

export class AiSetProviderCommand {
    public async handle(context: Context, args: AiSetProviderCommand.Args): Promise<void> {
        if (!isProvider(args.provider)) {
            throw new CliError({
                message: `Unknown provider '${args.provider}'. Supported: ${PROVIDERS.join(", ")}.`,
                code: CliError.Code.ConfigError
            });
        }

        const loader = new FernRcSchemaLoader();
        const { data } = await loader.load();
        await loader.save({ ...data, ai: { ...data.ai, provider: args.provider } });

        context.stderr.info(
            `${chalk.green("✓")} AI provider set to ${chalk.cyan(args.provider)} in ${chalk.cyan(loader.absoluteFilePath)}`
        );
        if (args.provider === "bedrock") {
            context.stderr.info(
                chalk.dim(
                    "  Bedrock uses AWS credentials from your environment (AWS_ACCESS_KEY_ID / AWS_PROFILE / etc.)"
                )
            );
        } else {
            context.stderr.info(chalk.dim(`  Run 'fern config ai set-key <key>' to store the API key.`));
        }
    }
}

// ---------------------------------------------------------------------------
// fern config ai set-key
// ---------------------------------------------------------------------------

export declare namespace AiSetKeyCommand {
    export interface Args extends GlobalArgs {
        key: string;
        provider?: string;
    }
}

export class AiSetKeyCommand {
    public async handle(context: Context, args: AiSetKeyCommand.Args): Promise<void> {
        const loader = new FernRcSchemaLoader();
        const { data } = await loader.load();

        // Resolve which provider this key is for: explicit --provider, then
        // configured provider, then default 'anthropic'.
        const providerInput = args.provider ?? data.ai?.provider ?? "anthropic";
        if (!isProvider(providerInput)) {
            throw new CliError({
                message: `Unknown provider '${providerInput}'. Supported: ${PROVIDERS.join(", ")}.`,
                code: CliError.Code.ConfigError
            });
        }

        if (providerInput === "bedrock") {
            throw new CliError({
                message:
                    `Provider 'bedrock' does not use a stored API key.\n` +
                    `  Bedrock reads credentials from your AWS environment (AWS_ACCESS_KEY_ID, AWS_PROFILE, etc.).`,
                code: CliError.Code.ConfigError
            });
        }

        // Store in OS keyring — never written to ~/.fernrc
        const credentialStore = new AiCredentialStore();
        await credentialStore.setKey(providerInput, args.key);

        context.stderr.info(
            `${chalk.green("✓")} ${providerInput} API key saved to ${chalk.cyan("OS keyring")} ${chalk.dim("(macOS Keychain / Linux libsecret / Windows Credential Manager)")}`
        );
        context.stderr.info(chalk.dim(`  Use 'fern config ai get-key --provider ${providerInput}' to verify it.`));
    }
}

// ---------------------------------------------------------------------------
// fern config ai get-key
// ---------------------------------------------------------------------------

export declare namespace AiGetKeyCommand {
    export interface Args extends GlobalArgs {
        provider?: string;
    }
}

export class AiGetKeyCommand {
    public async handle(context: Context, args: AiGetKeyCommand.Args): Promise<void> {
        const loader = new FernRcSchemaLoader();
        const { data } = await loader.load();

        const providerInput = args.provider ?? data.ai?.provider ?? "anthropic";
        if (!isProvider(providerInput)) {
            throw new CliError({
                message: `Unknown provider '${providerInput}'. Supported: ${PROVIDERS.join(", ")}.`,
                code: CliError.Code.ConfigError
            });
        }

        if (providerInput === "bedrock") {
            throw new CliError({
                message: `Provider 'bedrock' does not use a stored API key (uses AWS credentials).`,
                code: CliError.Code.ConfigError
            });
        }

        const credentialStore = new AiCredentialStore();
        const key = await credentialStore.getKey(providerInput);

        if (key == null || key === "") {
            throw new CliError({
                message:
                    `No ${providerInput} API key found in OS keyring.\n\n` +
                    `  Run 'fern config ai set-key --provider ${providerInput} <key>' to store one.`,
                code: CliError.Code.ConfigError
            });
        }

        const masked = key.length > 4 ? `${"*".repeat(key.length - 4)}${key.slice(-4)}` : "****";
        context.stdout.info(masked);
    }
}

// ---------------------------------------------------------------------------
// fern config ai status
// ---------------------------------------------------------------------------

export class AiStatusCommand {
    public async handle(context: Context, _args: GlobalArgs): Promise<void> {
        const loader = new FernRcSchemaLoader();
        const { data } = await loader.load();
        const credentialStore = new AiCredentialStore();

        const provider: Provider = (data.ai?.provider as Provider | undefined) ?? "anthropic";
        context.stdout.info(`provider: ${provider}`);

        // Check env vars first, then OS keyring
        const anthropicEnv = process.env["ANTHROPIC_API_KEY"];
        const openaiEnv = process.env["OPENAI_API_KEY"];
        const anthropicKeyring = await credentialStore.getKey("anthropic");
        const openaiKeyring = await credentialStore.getKey("openai");

        const anthropicStatus =
            anthropicEnv != null && anthropicEnv !== ""
                ? "set (env)"
                : anthropicKeyring != null && anthropicKeyring !== ""
                  ? "set (keyring)"
                  : "unset";

        const openaiStatus =
            openaiEnv != null && openaiEnv !== ""
                ? "set (env)"
                : openaiKeyring != null && openaiKeyring !== ""
                  ? "set (keyring)"
                  : "unset";

        context.stdout.info(`anthropic_api_key: ${anthropicStatus}`);
        context.stdout.info(`openai_api_key: ${openaiStatus}`);
        context.stdout.info(`aws_credentials: ${process.env["AWS_ACCESS_KEY_ID"] != null ? "set" : "unset"}`);
    }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

function addAiSetProviderCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new AiSetProviderCommand();
    command(
        cli,
        "set-provider <provider>",
        "Choose the AI provider for `fern check` fixes (anthropic, openai, or bedrock)",
        (context, args) => cmd.handle(context, args as AiSetProviderCommand.Args),
        (yargs) =>
            yargs.positional("provider", {
                type: "string",
                description: "AI provider name",
                choices: [...PROVIDERS],
                demandOption: true
            })
    );
}

function addAiSetKeyCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new AiSetKeyCommand();
    command(
        cli,
        "set-key <key>",
        "Store an API key in the OS keyring for AI-powered fixes",
        (context, args) => cmd.handle(context, args as AiSetKeyCommand.Args),
        (yargs) =>
            yargs
                .positional("key", {
                    type: "string",
                    description: "API key for the AI provider",
                    demandOption: true
                })
                .option("provider", {
                    type: "string",
                    description: "Provider this key is for (defaults to the configured provider)",
                    choices: [...PROVIDERS]
                })
    );
}

function addAiGetKeyCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new AiGetKeyCommand();
    command(
        cli,
        "get-key",
        "Show the stored API key for the AI provider (masked)",
        (context, args) => cmd.handle(context, args as AiGetKeyCommand.Args),
        (yargs) =>
            yargs.option("provider", {
                type: "string",
                description: "Provider whose key to read (defaults to the configured provider)",
                choices: [...PROVIDERS]
            })
    );
}

function addAiStatusCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new AiStatusCommand();
    command(cli, "status", "Show the configured AI provider and which credentials are set", (context, args) =>
        cmd.handle(context, args as GlobalArgs)
    );
}

export function addAiCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "ai", "Manage AI settings (provider and credentials for AI-powered fixes)", [
        addAiSetProviderCommand,
        addAiSetKeyCommand,
        addAiGetKeyCommand,
        addAiStatusCommand
    ]);
}
