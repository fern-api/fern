import { CliError } from "@fern-api/task-context";
import { FernRegistry, FernRegistryClient as GeneratorsClient } from "@fern-fern/generators-sdk";
import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { LANGUAGE_DISPLAY_NAMES, LANGUAGES, type Language } from "../../../sdk/config/Language.js";
import type { Target } from "../../../sdk/config/Target.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";

const GENERATOR_TYPES = ["sdk", "model", "server"] as const;
type GeneratorTypeFilter = (typeof GENERATOR_TYPES)[number];

export declare namespace ListCommand {
    export interface Args extends GlobalArgs {
        /** Filter results by language */
        language?: string;
        /** Filter results by generator type (sdk, model, server) */
        type?: string;
        /** Output results as JSON to stdout */
        json: boolean;
    }
}

export class ListCommand {
    public async handle(context: Context, args: ListCommand.Args): Promise<void> {
        const configuredTargets = await this.loadConfiguredTargets(context);

        const languageFilter = args.language != null ? this.parseLanguageFilter(args.language) : undefined;
        const typeFilter = args.type != null ? this.parseTypeFilter(args.type) : undefined;

        const availableGenerators = await this.fetchAvailableGenerators({ context, languageFilter, typeFilter });

        if (args.json) {
            this.printJson({ context, configuredTargets, availableGenerators, languageFilter, typeFilter });
            return;
        }

        this.printHuman({ context, configuredTargets, availableGenerators, languageFilter, typeFilter });
    }

    private async loadConfiguredTargets(context: Context): Promise<Target[]> {
        const result = await context.loadWorkspace();
        if (result == null || !result.success) {
            return [];
        }
        return result.workspace.sdks?.targets ?? [];
    }

    private async fetchAvailableGenerators({
        context,
        languageFilter,
        typeFilter
    }: {
        context: Context;
        languageFilter: Language | undefined;
        typeFilter: GeneratorTypeFilter | undefined;
    }): Promise<FernRegistry.generators.Generator[]> {
        const fdrOrigin = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com";
        const client = new GeneratorsClient({ environment: fdrOrigin });

        try {
            const response = await client.generators.listGenerators();
            if (!response.ok) {
                context.stderr.warn(chalk.dim("  Could not fetch available generators from registry."));
                return [];
            }
            let generators = response.body;

            if (languageFilter != null) {
                generators = generators.filter((g) => g.generatorLanguage === languageFilter);
            }
            if (typeFilter != null) {
                generators = generators.filter((g) => g.generatorType.type === typeFilter);
            }

            return generators;
        } catch {
            context.stderr.warn(chalk.dim("  Could not fetch available generators from registry (network error)."));
            return [];
        }
    }

    private printJson({
        context,
        configuredTargets,
        availableGenerators,
        languageFilter,
        typeFilter
    }: {
        context: Context;
        configuredTargets: Target[];
        availableGenerators: FernRegistry.generators.Generator[];
        languageFilter: Language | undefined;
        typeFilter: GeneratorTypeFilter | undefined;
    }): void {
        const filteredTargets = this.filterConfiguredTargets({
            targets: configuredTargets,
            languageFilter,
            typeFilter
        });

        const configured = filteredTargets.map((t) => ({
            name: t.name,
            language: t.lang,
            version: t.version,
            output: this.formatOutput(t),
            groups: t.groups ?? [],
            image: t.image
        }));

        const configuredImages = new Set(configuredTargets.map((t) => t.image));
        const available = availableGenerators
            .filter((g) => !configuredImages.has(g.dockerImage))
            .map((g) => ({
                id: g.id,
                displayName: g.displayName,
                type: g.generatorType.type,
                language: g.generatorLanguage ?? null,
                dockerImage: g.dockerImage
            }));

        context.stdout.info(JSON.stringify({ configured, available }, null, 2));
    }

    private printHuman({
        context,
        configuredTargets,
        availableGenerators,
        languageFilter,
        typeFilter
    }: {
        context: Context;
        configuredTargets: Target[];
        availableGenerators: FernRegistry.generators.Generator[];
        languageFilter: Language | undefined;
        typeFilter: GeneratorTypeFilter | undefined;
    }): void {
        const filteredTargets = this.filterConfiguredTargets({
            targets: configuredTargets,
            languageFilter,
            typeFilter
        });

        if (filteredTargets.length > 0) {
            context.stderr.info(`${Icons.info} ${chalk.cyan("Configured SDKs:")}`);
            context.stderr.info("");

            for (const target of filteredTargets) {
                const version = chalk.dim(`v${target.version}`);
                const output = chalk.dim(`→ ${this.formatOutput(target)}`);
                const groups =
                    target.groups != null && target.groups.length > 0
                        ? chalk.dim(` [${target.groups.join(", ")}]`)
                        : "";
                const displayName = LANGUAGE_DISPLAY_NAMES[target.lang] ?? target.name;
                context.stderr.info(
                    `  ${chalk.white(displayName.padEnd(14))} ${version.padEnd(20)} ${output}${groups}`
                );
            }
        } else if (languageFilter == null && typeFilter == null) {
            context.stderr.info(chalk.dim("No SDK targets configured."));
        } else {
            context.stderr.info(chalk.dim("No configured SDK targets match the given filters."));
        }

        const configuredImages = new Set(configuredTargets.map((t) => t.image));
        const unconfigured = availableGenerators.filter((g) => !configuredImages.has(g.dockerImage));

        if (unconfigured.length > 0) {
            context.stderr.info("");
            context.stderr.info(`${Icons.info} ${chalk.cyan("Available (not configured):")}`);
            context.stderr.info("");

            for (const gen of unconfigured) {
                const lang =
                    gen.generatorLanguage != null
                        ? chalk.dim(gen.generatorLanguage.padEnd(12))
                        : chalk.dim("".padEnd(12));
                const type = chalk.dim(`[${gen.generatorType.type}]`);
                context.stderr.info(`  ${chalk.white(gen.displayName.padEnd(20))} ${lang} ${type}`);
            }

            context.stderr.info("");
            context.stderr.info(chalk.dim("  Run 'fern sdk add --target <language>' to add a new SDK."));
        } else if (availableGenerators.length > 0) {
            context.stderr.info("");
            context.stderr.info(chalk.dim("  All available generators are already configured."));
        }
    }

    private filterConfiguredTargets({
        targets,
        languageFilter,
        typeFilter
    }: {
        targets: Target[];
        languageFilter: Language | undefined;
        typeFilter: GeneratorTypeFilter | undefined;
    }): Target[] {
        let filtered = targets;
        if (languageFilter != null) {
            filtered = filtered.filter((t) => t.lang === languageFilter);
        }
        if (typeFilter != null) {
            // Configured targets in fern.yml are SDK targets only;
            // filter out everything if a non-sdk type is requested.
            if ((typeFilter as string) !== "sdk") {
                return [];
            }
        }
        return filtered;
    }

    private formatOutput(target: Target): string {
        if (target.output.git != null) {
            const git = target.output.git;
            if ("repository" in git) {
                return git.repository;
            }
            if ("uri" in git) {
                return git.uri;
            }
        }
        return target.output.path ?? "./";
    }

    private parseLanguageFilter(value: string): Language {
        const lang = value.toLowerCase() as Language;
        if (LANGUAGES.includes(lang)) {
            return lang;
        }
        const supported = LANGUAGES.join(", ");
        throw new CliError({
            message: `"${value}" is not a supported language. Supported: ${supported}`,
            code: CliError.Code.ConfigError
        });
    }

    private parseTypeFilter(value: string): GeneratorTypeFilter {
        const type = value.toLowerCase() as GeneratorTypeFilter;
        if (GENERATOR_TYPES.includes(type)) {
            return type;
        }
        const supported = GENERATOR_TYPES.join(", ");
        throw new CliError({
            message: `"${value}" is not a supported generator type. Supported: ${supported}`,
            code: CliError.Code.ConfigError
        });
    }
}

export function addListCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new ListCommand();
    command(
        cli,
        "list",
        "List configured and available SDK generators",
        (context, args) => cmd.handle(context, args as ListCommand.Args),
        (yargs) =>
            yargs
                .option("language", {
                    type: "string",
                    description: "Filter by language (e.g. typescript, python, go)"
                })
                .option("type", {
                    type: "string",
                    description: "Filter by generator type (sdk, model, server)"
                })
                .option("json", {
                    type: "boolean",
                    default: false,
                    description: "Output results as JSON to stdout"
                })
    );
}
