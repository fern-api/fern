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
    return {
        namespace: namespaceExport,
        client: naming?.client ?? `${namespaceExport}Client`,
        error: naming?.error ?? `${namespaceExport}Error`,
        timeoutError: naming?.timeoutError ?? `${namespaceExport}TimeoutError`,
        environment: naming?.environment ?? `${namespaceExport}Environment`,
        environmentUrls: naming?.environmentUrls ?? `${namespaceExport}EnvironmentUrls`,
        version: naming?.version ?? `${namespaceExport}Version`
    };
}
