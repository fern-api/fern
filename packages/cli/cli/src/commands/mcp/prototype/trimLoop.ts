import { assertNever } from "@fern-api/core-utils";
import { select } from "@inquirer/prompts";
import chalk from "chalk";

import { CliContext } from "../../../cli-context/CliContext.js";
import { EndpointSummary } from "./openapiSummary.js";
import { computeVerdict, resolveTools, ToolsConfig } from "./toolset.js";
import { hint, ICONS, radioChoice, selectTheme, styledVerdictLine } from "./ui.js";

type TrimAction = "tag" | "method" | "path-prefix" | "keep";

function uniqueTags(endpoints: EndpointSummary[]): string[] {
    return [...new Set(endpoints.flatMap((endpoint) => endpoint.tags))];
}

/**
 * The interactive trim step: entered when a verdict is amber/red during
 * `fern mcp init`, or any time via `fern mcp tools --refine`. Offers
 * remove-by-tag / remove-by-method / remove-by-path-prefix until the user
 * keeps the toolset as-is.
 */
export async function runTrimLoop({
    cliContext,
    endpoints,
    initialConfig
}: {
    cliContext: CliContext;
    endpoints: EndpointSummary[];
    initialConfig: ToolsConfig;
}): Promise<ToolsConfig> {
    let config: ToolsConfig = { ...initialConfig, exclude: [...(initialConfig.exclude ?? [])] };
    const tags = uniqueTags(endpoints);

    while (true) {
        const verdict = computeVerdict(resolveTools(endpoints, config));
        cliContext.logger.info("");
        cliContext.logger.info(styledVerdictLine(verdict));
        if (verdict.level !== "green") {
            cliContext.logger.info(hint("Agents handle ~40 tools well — let's trim it (or keep it as-is)."));
        }

        const action = await select<TrimAction>({
            message: "Trim the toolset?",
            choices: [
                ...(tags.length > 0 ? [{ name: radioChoice("Remove endpoints by tag…"), value: "tag" as const }] : []),
                { name: radioChoice("Remove endpoints by method…"), value: "method" as const },
                { name: radioChoice("Remove endpoints by path prefix…"), value: "path-prefix" as const },
                { name: radioChoice("Keep as-is"), value: "keep" as const }
            ],
            theme: selectTheme
        });

        switch (action) {
            case "keep":
                return config;
            case "tag": {
                const tag = await select<string>({
                    message: "Which tag should be removed?",
                    choices: tags.map((candidate) => ({ name: radioChoice(candidate), value: candidate })),
                    theme: selectTheme
                });
                config = { ...config, exclude: [...(config.exclude ?? []), { tag }] };
                cliContext.logger.info(`${ICONS.success} Removed ${chalk.bold(tag)}`);
                break;
            }
            case "method": {
                const method = await select<string>({
                    message: "Which method should be removed?",
                    choices: ["GET", "POST", "PUT", "PATCH", "DELETE"].map((candidate) => ({
                        name: radioChoice(candidate),
                        value: candidate
                    })),
                    theme: selectTheme
                });
                config = { ...config, exclude: [...(config.exclude ?? []), { method }] };
                cliContext.logger.info(`${ICONS.success} Removed ${chalk.bold(method)} endpoints`);
                break;
            }
            case "path-prefix": {
                const prefix = await cliContext.getInput({
                    message: "Which path prefix should be removed? (e.g. /v1/admin)"
                });
                config = { ...config, exclude: [...(config.exclude ?? []), { "path-prefix": prefix }] };
                cliContext.logger.info(`${ICONS.success} Removed ${chalk.bold(`${prefix}*`)}`);
                break;
            }
            default:
                assertNever(action);
        }
    }
}
