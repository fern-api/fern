import { GROUP_NAME } from "./rules/generator.js";

/** Generator options SDK Config cannot hold (the same keys the hosted bridge allowlists). */
const CONFIG_KEYS = ["binaryName", "customCommands", "profiles", "rootGroup"];
/** Browser-login keys SDK Config cannot hold. */
const LOGIN_KEYS = ["client-id", "success-redirect-url", "error-redirect-url"];

/**
 * Copies the options a user set by hand in a previous rubicon output into the new one
 * (see README.md). Only keys SDK Config cannot express are carried; everything else comes
 * from sdk-config.yml again.
 */
export function carryOver(
    previous: Record<string, unknown> | undefined,
    next: Record<string, unknown>
): { generatorsYml: Record<string, unknown>; carried: string[] } {
    if (previous == null) {
        return { generatorsYml: next, carried: [] };
    }
    const carried: string[] = [];
    const config = carryConfig(firstGenerator(previous), firstGenerator(next), carried);
    const authSchemes = carryAuthSchemes(record(previous["auth-schemes"]), record(next["auth-schemes"]), carried);
    if (carried.length === 0) {
        return { generatorsYml: next, carried };
    }
    return {
        generatorsYml: {
            ...next,
            ...(authSchemes != null ? { "auth-schemes": authSchemes } : {}),
            ...(config != null ? { groups: withGeneratorConfig(next, config) } : {})
        },
        carried
    };
}

function carryConfig(
    previous: Record<string, unknown> | undefined,
    next: Record<string, unknown> | undefined,
    carried: string[]
): Record<string, unknown> | undefined {
    const previousConfig = record(previous?.config) ?? {};
    const additions = CONFIG_KEYS.filter((key) => previousConfig[key] !== undefined);
    if (additions.length === 0) {
        return undefined;
    }
    carried.push(...additions.map((key) => `groups.${GROUP_NAME}.generators[0].config.${key}`));
    return {
        ...(record(next?.config) ?? {}),
        ...Object.fromEntries(additions.map((key) => [key, previousConfig[key]]))
    };
}

function carryAuthSchemes(
    previous: Record<string, unknown> | undefined,
    next: Record<string, unknown> | undefined,
    carried: string[]
): Record<string, unknown> | undefined {
    if (previous == null || next == null) {
        return undefined;
    }
    let changed = false;
    const schemes = Object.fromEntries(
        Object.entries(next).map(([id, value]) => {
            const scheme = record(value);
            const old = record(previous[id]);
            if (scheme == null || old == null || scheme.scheme !== "oauth") {
                return [id, value];
            }
            const keys = [
                ...(scheme.type === "authorization-code" ? LOGIN_KEYS.filter((key) => old[key] !== undefined) : []),
                ...(old["token-prefix"] === "" && scheme["token-prefix"] === undefined ? ["token-prefix"] : [])
            ];
            if (keys.length === 0) {
                return [id, value];
            }
            changed = true;
            carried.push(...keys.map((key) => `auth-schemes.${id}.${key}`));
            return [id, { ...scheme, ...Object.fromEntries(keys.map((key) => [key, old[key]])) }];
        })
    );
    return changed ? schemes : undefined;
}

function firstGenerator(generatorsYml: Record<string, unknown>): Record<string, unknown> | undefined {
    const generators = record(record(generatorsYml.groups)?.[GROUP_NAME])?.generators;
    return Array.isArray(generators) ? record(generators[0]) : undefined;
}

function withGeneratorConfig(next: Record<string, unknown>, config: Record<string, unknown>): Record<string, unknown> {
    const groups = record(next.groups) ?? {};
    const group = record(groups[GROUP_NAME]) ?? {};
    const generators = Array.isArray(group.generators) ? group.generators : [];
    const [first, ...rest] = generators;
    return {
        ...groups,
        [GROUP_NAME]: { ...group, generators: [{ ...(record(first) ?? {}), config }, ...rest] }
    };
}

function record(value: unknown): Record<string, unknown> | undefined {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? { ...value } : undefined;
}
