import {
    checkOrganizationMembership,
    createOrganizationIfDoesNotExist,
    FernUserToken,
    getOrganizationNameValidationError,
    verifyAndDecodeJwt
} from "@fern-api/auth";
import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { getTokenFromAuth0 } from "@fern-api/login";
import chalk from "chalk";
import { execSync } from "child_process";
import inquirer from "inquirer";
import path from "path";
import type { FernYmlBuilder } from "../config/fern-yml/FernYmlBuilder";
import { TaskContextAdapter } from "../context/adapter/TaskContextAdapter";
import type { Context } from "../context/Context";
import type { Language } from "../sdk/config/Language";
import { Icons } from "../ui/format";

const LANGUAGE_DISPLAY_NAMES: Record<Language, string> = {
    typescript: "TypeScript",
    python: "Python",
    go: "Go",
    java: "Java",
    csharp: "C#",
    ruby: "Ruby",
    php: "PHP",
    rust: "Rust",
    swift: "Swift"
};

const LANGUAGE_ORDER: Language[] = ["typescript", "python", "go", "java", "csharp", "ruby", "php", "rust", "swift"];

const FERN_BANNER = [
    "███████╗███████╗██████╗ ███╗   ██╗",
    "██╔════╝██╔════╝██╔══██╗████╗  ██║",
    "█████╗  █████╗  ██████╔╝██╔██╗ ██║",
    "██╔══╝  ██╔══╝  ██╔══██╗██║╚██╗██║",
    "██║     ███████╗██║  ██║██║ ╚████║",
    "╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝"
]
    .map((line) => `  ${chalk.green(line)}`)
    .join("\n");

const BACK_VALUE = "__back__";
const BACK_CHOICE = new inquirer.Separator(" ");
const BACK_OPTION = { name: chalk.dim("← Back"), value: BACK_VALUE };

export declare namespace Wizard {
    export interface Args {
        org?: string;
        api?: string;
        yes: boolean;
    }

    export type ApiSource =
        | { type: "file"; format: FernYmlBuilder.SpecFormat; path: string }
        | { type: "url"; format: FernYmlBuilder.SpecFormat; url: string; filename: string; content: string }
        | { type: "sample" };

    export interface Result {
        organization: string;
        languages: Language[];
        outputs: Map<Language, FernYmlBuilder.OutputConfig>;
        apiSource: ApiSource;
        specFormat: FernYmlBuilder.SpecFormat;
        defaultGroup: string | undefined;
    }
}

/**
 * Thrown by a step to signal that the user wants to go back.
 */
class GoBackSignal {
    readonly _tag = "GoBackSignal";
}

export class Wizard {
    private readonly context: Context;
    private readonly args: Wizard.Args;

    constructor({ context, args }: { context: Context; args: Wizard.Args }) {
        this.context = context;
        this.args = args;
    }

    public async run(): Promise<Wizard.Result> {
        this.printWelcomeBanner();

        const result: Wizard.Result = {
            organization: "",
            languages: [],
            outputs: new Map(),
            apiSource: { type: "sample" },
            specFormat: "openapi",
            defaultGroup: undefined
        };

        const steps = ["organization", "product", "languages", "outputs", "specFormat", "apiSource"] as const;

        let stepIndex = 0;
        while (stepIndex < steps.length) {
            const step = steps[stepIndex];
            try {
                switch (step) {
                    case "organization": {
                        const resolved = await this.promptOrganization();
                        result.organization = resolved.organization;
                        await this.maybeValidateOrganization({
                            organization: result.organization,
                            token: resolved.token
                        });
                        break;
                    }
                    case "product":
                        await this.promptProduct();
                        break;
                    case "languages":
                        result.languages = await this.promptLanguages();
                        break;
                    case "outputs":
                        result.outputs = await this.promptOutputs(result.languages);
                        break;
                    case "specFormat":
                        result.specFormat = await this.promptSpecFormat();
                        break;
                    case "apiSource":
                        result.apiSource = await this.promptApiSource(result.specFormat);
                        break;
                }
                stepIndex++;
            } catch (error) {
                if (error instanceof GoBackSignal) {
                    stepIndex = Math.max(0, stepIndex - 1);
                } else {
                    throw error;
                }
            }
        }

        return {
            ...result,
            defaultGroup: result.outputs.size > 1 ? "default" : undefined
        };
    }

    private printWelcomeBanner(): void {
        if (!this.context.isTTY || this.args.yes) {
            return;
        }

        this.context.stderr.info(`${FERN_BANNER}\n`);
        this.context.stderr.info(`\n  ${chalk.bold.white("🌿 Welcome to Fern!")}`);
        this.context.stderr.info(`  ${chalk.dim("Instant Docs and SDKs for your API")}`);
        this.context.stderr.info(`  ${chalk.cyan.underline("https://buildwithfern.com/learn")}\n`);
    }

    private async promptOrganization(): Promise<{
        organization: string;
        token: FernUserToken | undefined;
    }> {
        if (this.args.org != null) {
            const token = await this.maybeAuthenticate();
            return { organization: this.args.org, token };
        }
        if (this.args.yes) {
            const org = this.getDefaultOrgName();
            const token = await this.maybeAuthenticate();
            return { organization: org, token };
        }
        const { org } = await inquirer.prompt<{ org: string }>([
            {
                type: "input",
                name: "org",
                message: "Organization name:",
                default: this.getDefaultOrgName(),
                validate: (input: string) => {
                    return getOrganizationNameValidationError(input) ?? true;
                }
            }
        ]);
        const token = await this.maybeAuthenticate();
        return { organization: org, token };
    }

    private async maybeAuthenticate(): Promise<FernUserToken | undefined> {
        if (!this.context.isTTY || this.args.yes) {
            return undefined;
        }
        try {
            const accountInfo = await this.context.tokenService.getActiveAccountInfo();
            if (accountInfo?.tokenInfo != null && !accountInfo.tokenInfo.isExpired) {
                this.context.stderr.info(`  ${Icons.success} Logged in as ${chalk.bold(accountInfo.user)}\n`);
                return { type: "user", value: accountInfo.tokenInfo.token };
            }

            const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
                {
                    type: "confirm",
                    name: "confirm",
                    message: "You are not logged in. Would you like to log in?",
                    default: true
                }
            ]);
            if (!confirm) {
                this.context.stderr.info(chalk.dim("  Skipping login. You can log in later with: fern auth login\n"));
                return undefined;
            }

            this.context.stderr.info(`  ${Icons.info} Opening browser to log in to Fern...`);
            const taskContext = new TaskContextAdapter({ context: this.context, logLevel: LogLevel.Info });
            const { accessToken, idToken } = await getTokenFromAuth0(taskContext, {
                useDeviceCodeFlow: false,
                forceReauth: false
            });

            const payload = await verifyAndDecodeJwt(idToken);
            if (payload == null || payload.email == null) {
                this.context.stderr.info(
                    chalk.dim("  Could not authenticate. You can log in later with: fern auth login\n")
                );
                return undefined;
            }

            await this.context.tokenService.login(payload.email, accessToken);
            this.context.stderr.info(`  ${Icons.success} Logged in as ${chalk.bold(payload.email)}\n`);

            return { type: "user", value: accessToken };
        } catch {
            this.context.stderr.info(
                chalk.dim("  Could not authenticate. You can log in later with: fern auth login\n")
            );
            return undefined;
        }
    }

    private async maybeValidateOrganization({
        organization,
        token
    }: {
        organization: string;
        token: FernUserToken | undefined;
    }): Promise<void> {
        if (token == null) {
            return;
        }

        try {
            const result = await checkOrganizationMembership({ organization, token });

            switch (result.type) {
                case "member":
                    this.context.stderr.info(`  ${Icons.success} Organization "${organization}" found\n`);
                    return;

                case "not-found": {
                    const taskContext = new TaskContextAdapter({ context: this.context });
                    const created = await createOrganizationIfDoesNotExist({
                        organization,
                        token,
                        context: taskContext
                    });
                    if (created) {
                        this.context.stderr.info(`  ${Icons.success} Created organization "${organization}"\n`);
                    }
                    return;
                }

                case "no-access": {
                    this.context.stderr.info(
                        `\n  ${Icons.error} You don't have access to the organization "${organization}".\n`
                    );

                    const accounts = await this.context.tokenService.getAllAccountInfo();
                    const hasMultipleAccounts = accounts.length > 1;

                    const choices = [
                        { name: "Request access", value: "request" },
                        ...(hasMultipleAccounts ? [{ name: "Switch account", value: "switch" }] : []),
                        { name: "Use a different name", value: "different" }
                    ];

                    const { action } = await inquirer.prompt<{ action: string }>([
                        {
                            type: "list",
                            name: "action",
                            message: "What would you like to do?",
                            loop: false,
                            choices
                        }
                    ]);

                    if (action === "request") {
                        // TODO: We should actually submit a request to access to the admin.
                        this.context.stderr.info(
                            chalk.dim(
                                `\n  Access requested for "${organization}". Ask an admin to approve, or pick a different name.\n`
                            )
                        );
                    } else if (action === "switch") {
                        await this.promptAccountSwitch(accounts);
                    }

                    throw new GoBackSignal();
                }

                case "unknown-error":
                    this.context.stderr.info(
                        chalk.dim("  Could not validate organization. You can create it later.\n")
                    );
                    return;
            }
        } catch (error) {
            if (error instanceof GoBackSignal) {
                throw error;
            }
            this.context.stderr.info(chalk.dim("  Could not validate organization. You can create it later.\n"));
        }
    }

    private async promptProduct(): Promise<void> {
        if (this.args.yes) {
            return;
        }

        const { product } = await inquirer.prompt<{ product: string }>([
            {
                type: "list",
                name: "product",
                message: "What would you like to generate?",
                loop: false,
                choices: [
                    { name: "SDKs", value: "sdks" },
                    { name: "Docs", value: "docs" },
                    { name: "Both", value: "both" },
                    BACK_CHOICE,
                    BACK_OPTION
                ]
            }
        ]);

        if (product === BACK_VALUE) {
            throw new GoBackSignal();
        }

        if (product === "docs" || product === "both") {
            this.context.stderr.info(
                `\n  ${chalk.yellow("Docs support is coming soon!")} For now, we'll set up SDK generation.`
            );
            this.context.stderr.info(chalk.dim("  Learn more: https://buildwithfern.com/learn/docs\n"));
        }
    }

    private async promptLanguages(): Promise<Language[]> {
        if (this.args.yes) {
            return ["typescript"];
        }

        const { languages } = await inquirer.prompt<{ languages: Language[] }>([
            {
                type: "checkbox",
                name: "languages",
                message: "Which SDK languages would you like to generate?",
                loop: false,
                choices: LANGUAGE_ORDER.map((lang) => ({
                    name: LANGUAGE_DISPLAY_NAMES[lang],
                    value: lang,
                    checked: lang === "typescript"
                })),
                validate: (input: Language[]) => {
                    if (input.length === 0) {
                        return "Select at least one language.";
                    }
                    return true;
                }
            }
        ]);

        return languages;
    }

    private async promptOutputs(languages: Language[]): Promise<Map<Language, FernYmlBuilder.OutputConfig>> {
        const outputs = new Map<Language, FernYmlBuilder.OutputConfig>();

        const group = languages.length > 1 ? "default" : undefined;
        if (this.args.yes) {
            for (const lang of languages) {
                outputs.set(lang, { type: "local", path: `./sdks/${lang}`, group });
            }
            return outputs;
        }

        const firstLang = languages[0];
        if (languages.length === 1 && firstLang != null) {
            const output = await this.promptSingleLanguageOutput({ lang: firstLang, group });
            if (output === BACK_VALUE) {
                throw new GoBackSignal();
            }
            outputs.set(firstLang, output);
            return outputs;
        }

        const { strategy } = await inquirer.prompt<{ strategy: string }>([
            {
                type: "list",
                name: "strategy",
                message: "Where should the generated SDKs be written?",
                loop: false,
                choices: [
                    { name: "All to local directories", value: "all-local" },
                    { name: "All to GitHub repositories", value: "all-github" },
                    { name: "Configure each separately", value: "each" },
                    BACK_CHOICE,
                    BACK_OPTION
                ]
            }
        ]);
        if (strategy === BACK_VALUE) {
            throw new GoBackSignal();
        }
        if (strategy === "all-local") {
            for (const lang of languages) {
                outputs.set(lang, { type: "local", path: `./sdks/${lang}`, group });
            }
            return outputs;
        }
        if (strategy === "all-github") {
            const mode = await this.promptGitMode();
            for (const lang of languages) {
                const { repo } = await inquirer.prompt<{ repo: string }>([
                    {
                        type: "input",
                        name: "repo",
                        message: `GitHub repository for ${LANGUAGE_DISPLAY_NAMES[lang]} (owner/repo):`,
                        validate: (input: string) => {
                            if (!/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(input)) {
                                return "Please enter a valid repository in owner/repo format.";
                            }
                            return true;
                        }
                    }
                ]);
                outputs.set(lang, { type: "git", repository: repo, mode, group });
            }
            return outputs;
        }
        for (const lang of languages) {
            const output = await this.promptSingleLanguageOutput({ lang, group });
            if (output === BACK_VALUE) {
                throw new GoBackSignal();
            }
            outputs.set(lang, output);
        }
        return outputs;
    }

    private async promptSingleLanguageOutput({
        lang,
        group
    }: {
        lang: Language;
        group: string | undefined;
    }): Promise<FernYmlBuilder.OutputConfig | typeof BACK_VALUE> {
        const { destination } = await inquirer.prompt<{ destination: string }>([
            {
                type: "list",
                name: "destination",
                message: `Where should the ${LANGUAGE_DISPLAY_NAMES[lang]} SDK be saved?`,
                loop: false,
                choices: [
                    { name: "Local directory", value: "local" },
                    { name: "GitHub repository", value: "github" },
                    BACK_CHOICE,
                    BACK_OPTION
                ]
            }
        ]);

        if (destination === BACK_VALUE) {
            return BACK_VALUE;
        }
        if (destination === "local") {
            const { outputPath } = await inquirer.prompt<{ outputPath: string }>([
                {
                    type: "input",
                    name: "outputPath",
                    message: "Output directory:",
                    default: `./sdks/${lang}`
                }
            ]);
            return { type: "local", path: outputPath, group };
        }

        const { repo } = await inquirer.prompt<{ repo: string }>([
            {
                type: "input",
                name: "repo",
                message: "GitHub repository (owner/repo):",
                validate: (input: string) => {
                    if (!/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(input)) {
                        return "Please enter a valid repository in owner/repo format.";
                    }
                    return true;
                }
            }
        ]);

        const mode = await this.promptGitMode();
        return { type: "git", repository: repo, mode, group };
    }

    private async promptGitMode(): Promise<"pr" | "release" | "push"> {
        const { mode } = await inquirer.prompt<{ mode: "pr" | "release" | "push" }>([
            {
                type: "list",
                name: "mode",
                message: "Git publishing mode:",
                loop: false,
                choices: [
                    { name: "Pull Request", value: "pr" },
                    { name: "Release", value: "release" },
                    { name: "Push to branch", value: "push" }
                ]
            }
        ]);
        return mode;
    }

    private async promptSpecFormat(): Promise<FernYmlBuilder.SpecFormat> {
        if (this.args.yes) {
            return "openapi";
        }

        const { format } = await inquirer.prompt<{ format: FernYmlBuilder.SpecFormat | typeof BACK_VALUE }>([
            {
                type: "list",
                name: "format",
                message: "What type of API definition do you have?",
                loop: false,
                choices: [
                    { name: "OpenAPI", value: "openapi" },
                    { name: "AsyncAPI", value: "asyncapi" },
                    BACK_CHOICE,
                    BACK_OPTION
                ]
            }
        ]);

        if (format === BACK_VALUE) {
            throw new GoBackSignal();
        }

        return format;
    }

    private async promptApiSource(specFormat: FernYmlBuilder.SpecFormat): Promise<Wizard.ApiSource> {
        if (this.args.api != null) {
            const api = this.args.api;
            if (api.startsWith("http://") || api.startsWith("https://")) {
                return await this.fetchApiFromUrl(api, specFormat);
            }
            return { type: "file", format: specFormat, path: api };
        }

        if (this.args.yes) {
            return { type: "sample" };
        }

        const formatLabel = specFormat === "openapi" ? "OpenAPI" : "AsyncAPI";

        const choices = [
            ...(specFormat === "openapi" ? [{ name: "Start with the sample Pet Store API", value: "sample" }] : []),
            { name: `Use an existing ${formatLabel} file`, value: "file" },
            { name: `Use a URL to an ${formatLabel} file`, value: "url" },
            BACK_CHOICE,
            BACK_OPTION
        ];

        const { source } = await inquirer.prompt<{ source: string }>([
            {
                type: "list",
                name: "source",
                message: "How would you like to provide your API definition?",
                loop: false,
                choices
            }
        ]);

        if (source === BACK_VALUE) {
            throw new GoBackSignal();
        }

        if (source === "sample") {
            return { type: "sample" };
        }

        if (source === "file") {
            const result = await this.promptApiFile(specFormat);
            if (result === BACK_VALUE) {
                return await this.promptApiSource(specFormat);
            }
            return result;
        }

        const result = await this.promptApiUrl(specFormat);
        if (result === BACK_VALUE) {
            return await this.promptApiSource(specFormat);
        }
        return result;
    }

    private async promptApiFile(specFormat: FernYmlBuilder.SpecFormat): Promise<Wizard.ApiSource | typeof BACK_VALUE> {
        const formatLabel = specFormat === "openapi" ? "OpenAPI" : "AsyncAPI";

        // On macOS, offer to open the native Finder file picker.
        if (process.platform === "darwin") {
            // Loop so that cancelling Finder returns to this menu.
            //
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { method } = await inquirer.prompt<{ method: string }>([
                    {
                        type: "list",
                        name: "method",
                        message: `How would you like to select your ${formatLabel} file?`,
                        loop: false,
                        choices: [
                            { name: "Browse with Finder", value: "finder" },
                            { name: "Type a file path", value: "manual" },
                            BACK_CHOICE,
                            BACK_OPTION
                        ]
                    }
                ]);

                if (method === BACK_VALUE) {
                    return BACK_VALUE;
                }

                if (method === "finder") {
                    const selected = this.openMacOsFinderDialog();
                    if (selected != null) {
                        const relativePath = path.relative(this.context.cwd, selected);
                        const normalizedPath = relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
                        return { type: "file", format: specFormat, path: normalizedPath };
                    }
                    this.context.stderr.info(chalk.dim("  No file selected.\n"));
                    continue;
                }

                // Fall through to manual input below.
                break;
            }
        }

        const { filePath } = await inquirer.prompt<{ filePath: string }>([
            {
                type: "input",
                name: "filePath",
                message: `Path to your ${formatLabel} file ${chalk.dim("(empty to go back)")}:`,
                validate: async (input: string) => {
                    if (input.trim().length === 0) {
                        return true;
                    }
                    const resolved = path.resolve(this.context.cwd, input);
                    const exists = await doesPathExist(AbsoluteFilePath.of(resolved));
                    if (!exists) {
                        return `File not found: ${input}`;
                    }
                    return true;
                }
            }
        ]);

        if (filePath.trim().length === 0) {
            return BACK_VALUE;
        }

        const relativePath = path.relative(this.context.cwd, path.resolve(this.context.cwd, filePath));
        const normalizedPath = relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
        return { type: "file", format: specFormat, path: normalizedPath };
    }

    private async promptApiUrl(specFormat: FernYmlBuilder.SpecFormat): Promise<Wizard.ApiSource | typeof BACK_VALUE> {
        const formatLabel = specFormat === "openapi" ? "OpenAPI" : "AsyncAPI";

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { url } = await inquirer.prompt<{ url: string }>([
                {
                    type: "input",
                    name: "url",
                    message: `URL to your ${formatLabel} file ${chalk.dim("(empty to go back)")}:`,
                    validate: (input: string) => {
                        if (input.trim().length === 0) {
                            return true;
                        }
                        if (!input.startsWith("http://") && !input.startsWith("https://")) {
                            return "Please enter a valid URL starting with http:// or https://";
                        }
                        return true;
                    }
                }
            ]);

            if (url.trim().length === 0) {
                return BACK_VALUE;
            }

            try {
                return await this.fetchApiFromUrl(url, specFormat);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                this.context.stderr.info(`  ${Icons.error} Could not fetch ${url}: ${message}\n`);
                // Loop back to re-prompt.
            }
        }
    }

    private async fetchApiFromUrl(url: string, specFormat: FernYmlBuilder.SpecFormat): Promise<Wizard.ApiSource> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        const content = await response.text();
        const filename = this.resolveFilenameFromUrl({ url, specFormat });
        return { type: "url", format: specFormat, url, filename, content };
    }

    private resolveFilenameFromUrl({
        url,
        specFormat
    }: {
        url: string;
        specFormat: FernYmlBuilder.SpecFormat;
    }): string {
        const defaultFilename = specFormat === "openapi" ? "openapi.yml" : "asyncapi.yml";
        try {
            const pathname = new URL(url).pathname;
            const basename = path.basename(pathname);
            if (basename.includes(".")) {
                return basename;
            }
            return defaultFilename;
        } catch {
            return defaultFilename;
        }
    }

    private async promptAccountSwitch(accounts: Array<{ user: string; isActive: boolean }>): Promise<void> {
        const choices = accounts.map((account) => ({
            name: account.isActive ? `${account.user} ${chalk.dim("(current)")}` : account.user,
            value: account.user,
            disabled: account.isActive ? ("" as const) : false
        }));

        const { selectedUser } = await inquirer.prompt<{ selectedUser: string }>([
            {
                type: "list",
                name: "selectedUser",
                message: "Select account:",
                choices
            }
        ]);

        const success = await this.context.tokenService.switchAccount(selectedUser);
        if (success) {
            this.context.stderr.info(`  ${Icons.success} Switched to ${chalk.bold(selectedUser)}\n`);
        }
    }

    /**
     * Returns the default organization name for the current working directory.
     *
     * @example
     * /Users/jane/my-project -> my-project
     */
    private getDefaultOrgName(): string {
        const cwdBasename = path.basename(this.context.cwd);
        return (
            cwdBasename
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "-")
                .replace(/^-+|-+$/g, "")
                .replace(/-+/g, "-") || "my-company"
        );
    }

    /**
     * Opens a native macOS Finder file picker dialog.
     */
    private openMacOsFinderDialog(): string | undefined {
        try {
            const result = execSync(
                `osascript -e 'POSIX path of (choose file with prompt "Select your API spec:" of type {"json", "yml", "yaml"})'`,
                { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
            );
            return result.trim();
        } catch {
            return undefined;
        }
    }
}
