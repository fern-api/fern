import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernBasePathExtension {
    export interface Args extends AbstractExtension.Args {
        document: object;
    }

    export interface ParsedParameter {
        name: string;
        type: string;
        default: unknown | undefined;
        docs: string | undefined;
    }

    export interface ParsedValue {
        path: string;
        parameters: ParsedParameter[];
    }
}

const PLACEHOLDER_REGEX = /\{([^}]+)\}/g;

export class FernBasePathExtension extends AbstractExtension<FernBasePathExtension.ParsedValue> {
    private readonly document: object;
    public readonly key = "x-fern-base-path";

    constructor({ breadcrumbs, document, context }: FernBasePathExtension.Args) {
        super({ breadcrumbs, context });
        this.document = document;
    }

    public convert(): FernBasePathExtension.ParsedValue | undefined {
        const value = this.getExtensionValue(this.document);
        if (value == null) {
            return undefined;
        }

        if (typeof value === "string") {
            return this.parseString(value);
        }

        if (typeof value === "object" && !Array.isArray(value)) {
            return this.parseStructured(value as Record<string, unknown>);
        }

        this.context.errorCollector.collect({
            message: "Expected `x-fern-base-path` to be a string or object",
            path: this.breadcrumbs
        });
        return undefined;
    }

    private parseString(path: string): FernBasePathExtension.ParsedValue | undefined {
        if (!this.validatePath(path)) {
            return undefined;
        }
        return { path, parameters: [] };
    }

    private parseStructured(obj: Record<string, unknown>): FernBasePathExtension.ParsedValue | undefined {
        const path = obj["path"];
        if (typeof path !== "string") {
            this.context.errorCollector.collect({
                message: "`x-fern-base-path.path` must be a string",
                path: this.breadcrumbs
            });
            return undefined;
        }
        if (!this.validatePath(path)) {
            return undefined;
        }

        const placeholders = extractPlaceholders(path);
        const rawParameters = obj["parameters"];
        if (rawParameters != null && (typeof rawParameters !== "object" || Array.isArray(rawParameters))) {
            this.context.errorCollector.collect({
                message: "`x-fern-base-path.parameters` must be an object map",
                path: [...this.breadcrumbs, "parameters"]
            });
            return undefined;
        }
        const parametersMap = (rawParameters ?? {}) as Record<string, unknown>;

        // Every explicit `parameters` entry must appear in the path.
        for (const name of Object.keys(parametersMap)) {
            if (!placeholders.has(name)) {
                this.context.errorCollector.collect({
                    message: `Parameter '${name}' does not appear in the base path '${path}'`,
                    path: [...this.breadcrumbs, "parameters", name]
                });
                return undefined;
            }
        }

        // Build a parameter list. Placeholders without explicit entries default to `type: string`.
        const parameters: FernBasePathExtension.ParsedParameter[] = [];
        for (const name of placeholders) {
            const raw = parametersMap[name];
            if (raw == null) {
                parameters.push({ name, type: "string", default: undefined, docs: undefined });
                continue;
            }
            if (typeof raw !== "object" || Array.isArray(raw)) {
                this.context.errorCollector.collect({
                    message: `Parameter '${name}' must be an object`,
                    path: [...this.breadcrumbs, "parameters", name]
                });
                return undefined;
            }
            const entry = raw as Record<string, unknown>;
            const type = typeof entry["type"] === "string" ? (entry["type"] as string) : "string";
            const docs = typeof entry["docs"] === "string" ? (entry["docs"] as string) : undefined;
            parameters.push({
                name,
                type,
                default: entry["default"],
                docs
            });
        }

        return { path, parameters };
    }

    private validatePath(path: string): boolean {
        if (!path.startsWith("/")) {
            this.context.errorCollector.collect({
                message: "`x-fern-base-path` path must start with '/'",
                path: this.breadcrumbs
            });
            return false;
        }
        return true;
    }
}

function extractPlaceholders(path: string): Set<string> {
    const result = new Set<string>();
    let match: RegExpExecArray | null;
    const regex = new RegExp(PLACEHOLDER_REGEX.source, "g");
    while ((match = regex.exec(path)) != null) {
        if (match[1] != null) {
            result.add(match[1]);
        }
    }
    return result;
}
