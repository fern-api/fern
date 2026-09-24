import { FernIr } from "@fern-fern/ir-sdk";

function createName(originalName: string): FernIr.Name {
    const lower = originalName.toLowerCase();
    const upper = originalName.toUpperCase();
    return {
        originalName,
        camelCase: { unsafeName: lower, safeName: lower },
        snakeCase: { unsafeName: lower, safeName: lower },
        screamingSnakeCase: { unsafeName: upper, safeName: upper },
        pascalCase: { unsafeName: originalName, safeName: originalName }
    };
}

export function createMultipleBaseUrlsEnvironmentsConfig({
    baseUrls,
    environments,
    defaultEnvironment
}: {
    baseUrls: string[];
    environments: Record<string, Record<string, string>>;
    defaultEnvironment?: string;
}): FernIr.EnvironmentsConfig {
    const baseUrlsWithIds = baseUrls.map((id) => ({
        id,
        name: createName(id),
        displayName: id,
        docs: undefined
    })) as FernIr.EnvironmentBaseUrlWithId[];
    const environmentList = Object.entries(environments).map(([name, urls]) => ({
        id: `${name}Id`,
        name: createName(name),
        displayName: name,
        urls,
        docs: undefined
    })) as unknown as FernIr.MultipleBaseUrlsEnvironment[];
    const config = { environments: environmentList, baseUrls: baseUrlsWithIds };

    return {
        defaultEnvironment: defaultEnvironment != null ? `${defaultEnvironment}Id` : undefined,
        environments: {
            type: "multipleBaseUrls",
            ...config,
            _visit: (visitor: { multipleBaseUrls: (config: FernIr.MultipleBaseUrlsEnvironments) => unknown }) =>
                visitor.multipleBaseUrls(config as FernIr.MultipleBaseUrlsEnvironments)
        } as unknown as FernIr.EnvironmentsConfig["environments"]
    } as FernIr.EnvironmentsConfig;
}
