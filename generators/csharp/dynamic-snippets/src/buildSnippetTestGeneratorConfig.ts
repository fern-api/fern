/**
 * The compiled C# dynamic-snippet tests are built against the generated SDK, so the snippets they
 * contain must reference the internal client class. `exported-client-class-name` is a docs-only
 * override that names the customer's hand-written wrapper class — a class that is not part of
 * generator output. If it reached the snippet-test generator, the generated `new <ExportedClient>(...)`
 * instantiation would name a class that does not exist and fail to compile. Strip the docs-only
 * override here so snippet tests always reference the generated client.
 */
export function buildSnippetTestGeneratorConfig<Config extends { customConfig?: unknown }>(config: Config): Config {
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
