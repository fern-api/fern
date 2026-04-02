export function resolveEnv(
    env: Record<string, string> | undefined,
    repoRoot: string
): Record<string, string> | undefined {
    if (env == null) {
        return undefined;
    }
    const resolved: Record<string, string> = {};
    for (const [key, value] of Object.entries(env)) {
        resolved[key] = value.replace("{REPO_ROOT}", repoRoot).replace("{PATH}", process.env.PATH ?? "");
    }
    return resolved;
}
