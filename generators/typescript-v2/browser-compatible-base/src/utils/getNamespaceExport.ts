import { camelCase, upperFirst } from "lodash-es";

export function getNamespaceExport({
    organization,
    workspaceName,
    namespaceExport,
    namingNamespace
}: {
    organization: string;
    workspaceName: string;
    namespaceExport?: string;
    namingNamespace?: string;
}): string {
    return (
        namingNamespace ??
        namespaceExport ??
        `${upperFirst(camelCase(organization))}${upperFirst(camelCase(workspaceName))}`
    );
}

export interface ResolvedNaming {
    namespace: string;
    client: string;
    error: string;
    timeoutError: string;
    environment: string;
    environmentUrls: string;
    version: string;
}

export function resolveNaming({
    namespaceExport,
    naming
}: {
    namespaceExport: string;
    naming?: {
        namespace?: string;
        client?: string;
        error?: string;
        timeoutError?: string;
        environment?: string;
        environmentUrls?: string;
        version?: string;
    };
}): ResolvedNaming {
    // When naming config is explicitly provided, PascalCase the namespace for deriving
    // default suffix names (e.g., namespace: "xai" → XaiClient). When no naming config
    // is provided, use namespaceExport as-is to preserve backwards compatibility
    // (e.g., namespaceExport: "MySDK" → MySDKClient).
    const suffixBase = naming != null ? upperFirst(camelCase(namespaceExport)) : namespaceExport;
    return {
        namespace: namespaceExport,
        client: naming?.client ?? `${suffixBase}Client`,
        error: naming?.error ?? `${suffixBase}Error`,
        timeoutError: naming?.timeoutError ?? `${suffixBase}TimeoutError`,
        environment: naming?.environment ?? `${suffixBase}Environment`,
        environmentUrls: naming?.environmentUrls ?? `${suffixBase}EnvironmentUrls`,
        version: naming?.version ?? `${suffixBase}Version`
    };
}
