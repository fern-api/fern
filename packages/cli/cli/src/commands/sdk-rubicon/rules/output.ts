import { isAbsolute, relative, resolve, sep } from "node:path";

import type { RuleContext } from "../types.js";

/** The generators.yml `api` section, created on first use. */
export function apiSection(context: RuleContext): Record<string, unknown> {
    const existing = context.output.generatorsYml.api;
    if (isRecord(existing)) {
        return existing;
    }
    const created: Record<string, unknown> = {};
    context.output.generatorsYml.api = created;
    return created;
}

/** The generators.yml `auth-schemes` section, created on first use. */
export function authSchemes(context: RuleContext): Record<string, unknown> {
    const existing = context.output.generatorsYml["auth-schemes"];
    if (isRecord(existing)) {
        return existing;
    }
    const created: Record<string, unknown> = {};
    context.output.generatorsYml["auth-schemes"] = created;
    return created;
}

/** A path from sdk-config.yml's folder, rewritten relative to the generators.yml folder. */
export function relativeToOutput(context: RuleContext, path: string): string {
    const target = relative(context.input.outDir, resolveFromConfig(context, path)).split(sep).join("/");
    return target.startsWith(".") ? target : `./${target}`;
}

export function resolveFromConfig(context: RuleContext, path: string): string {
    return isAbsolute(path) ? path : resolve(context.input.configDir, path);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
