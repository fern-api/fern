import type { Options } from "yargs";
import { LAYOUTS } from "./docs-site/options";
import type { Product, SplashStyle } from "./types";

export const SPLASH_STYLES: SplashStyle[] = ["orb", "burst", "filings", "brooklyn"];
export const PRODUCTS: Product[] = ["docs", "sdks"];

// The wizard prints HELP_TEXT itself instead of yargs' generated help, so keep the two in sync
// (a test checks that every visible option is documented).
export const CLI_OPTIONS = {
    dir: { type: "string", default: process.cwd() },
    org: { type: "string" },
    yes: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    products: {
        type: "string",
        array: true,
        choices: PRODUCTS,
        // Accept "docs,sdks" as well as "docs sdks".
        coerce: (values: string[]) => values.flatMap((value) => value.split(",")).filter((value) => value !== "")
    },
    spec: { type: "string" },
    brand: { type: "string" },
    "skip-brand": { type: "boolean", default: false },
    template: { type: "string", choices: LAYOUTS.map((layout) => layout.flag) },
    "skip-install": { type: "boolean", default: false },
    "skip-mcp": { type: "boolean", default: false },
    help: { type: "boolean", alias: "h", default: false },
    // For comparing startup animations; not documented.
    splash: { type: "string", choices: SPLASH_STYLES, default: "burst", hidden: true }
} satisfies Record<string, Options>;

export const HELP_TEXT = `Usage: fern-wizard [options]

Sets up Fern in a repository: a Fern project from your API spec, a docs site,
SDKs, and instructions for your coding agent. Asks before each step.

Options:
  --dir <path>         Repository to set up (default: current directory)
  --org <name>         Fern organization (created if it doesn't exist)
  --yes                Don't prompt; use the defaults
  --dry-run            Show the plan without changing anything
  --products <list>    What to set up: docs, sdks, or both
  --spec <path>        API spec to import, relative to --dir
  --brand <company>    Company name or website for the docs logo and colors
  --skip-brand         Keep the starter docs branding
  --template <name>    Docs layout: stacked, side-by-side, or minimal
  --skip-install       Don't install the Fern CLI if it's missing
  --skip-mcp           Don't connect Fern's MCP server to your coding agents
  -h, --help           Show this help
  --version            Show the version

With --yes, pass --org (unless fern/fern.config.json has one). The wizard then
sets up the project, docs site, and agent instructions, but doesn't publish docs
or generate SDKs. Run \`fern generate --docs\` and \`fern generate\` for those.

Examples:
  fern-wizard                          Set up interactively
  fern-wizard --dry-run --yes          Show the plan
  fern-wizard --yes --org acme         Set up without prompts`;
