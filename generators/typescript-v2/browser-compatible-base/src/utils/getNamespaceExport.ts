import { camelCase, upperFirst } from "lodash-es";

export function getNamespaceExport({
    organization,
    workspaceName,
    namespaceExport,
    naming
}: {
    organization: string;
    workspaceName: string;
    namespaceExport?: string;
    naming?: string | { namespace?: string };
}): string {
    const namingNamespace = typeof naming === "string" ? naming : naming?.namespace;
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
    naming?:
        | string
        | {
              namespace?: string;
              client?: string;
              error?: string;
              timeoutError?: string;
              environment?: string;
              environmentUrls?: string;
              version?: string;
          };
}): ResolvedNaming {
    // Normalize string shorthand to object form
    const namingObj = typeof naming === "string" ? {} : naming;
    // When naming config is explicitly provided, PascalCase the namespace for deriving
    // default suffix names (e.g., namespace: "xai" → XaiClient). When no naming config
    // is provided, use namespaceExport as-is to preserve backwards compatibility
    // (e.g., namespaceExport: "MySDK" → MySDKClient).
    const suffixBase = naming != null ? upperFirst(camelCase(namespaceExport)) : namespaceExport;
    return {
        namespace: namespaceExport,
        client: namingObj?.client ?? `${suffixBase}Client`,
        error: namingObj?.error ?? `${suffixBase}Error`,
        timeoutError: namingObj?.timeoutError ?? `${suffixBase}TimeoutError`,
        environment: namingObj?.environment ?? `${suffixBase}Environment`,
        environmentUrls: namingObj?.environmentUrls ?? `${suffixBase}EnvironmentUrls`,
        version: namingObj?.version ?? `${suffixBase}Version`
    };
}
