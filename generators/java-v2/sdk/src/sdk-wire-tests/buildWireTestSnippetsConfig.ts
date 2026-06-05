/**
 * Wire tests compile against the generated SDK, so the snippets embedded in them must reference
 * the internal client class. Docs-only naming overrides must not reach the wire-test snippet
 * generator: the generated snippet's import and instantiation would otherwise name a class (the
 * customer's hand-written exported wrapper) that does not exist in generator output, and the
 * extracted imports written into the test file would fail to compile.
 */
export function buildWireTestSnippetsConfig<Config extends { customConfig?: unknown }>(config: Config): Config {
    const { customConfig } = config;
    if (customConfig == null || typeof customConfig !== "object" || Array.isArray(customConfig)) {
        return config;
    }
    const entries: [string, unknown][] = Object.entries(customConfig);
    if (!entries.some(([key]) => key === "exported-client-class-name")) {
        return config;
    }
    return {
        ...config,
        customConfig: Object.fromEntries(entries.filter(([key]) => key !== "exported-client-class-name"))
    };
}
