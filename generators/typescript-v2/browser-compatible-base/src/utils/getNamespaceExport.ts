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
    const pascalNamespace = upperFirst(camelCase(namespaceExport));
    return {
        namespace: namespaceExport,
        client: naming?.client ?? `${pascalNamespace}Client`,
        error: naming?.error ?? `${pascalNamespace}Error`,
        timeoutError: naming?.timeoutError ?? `${pascalNamespace}TimeoutError`,
        environment: naming?.environment ?? `${pascalNamespace}Environment`,
        environmentUrls: naming?.environmentUrls ?? `${pascalNamespace}EnvironmentUrls`,
        version: naming?.version ?? `${pascalNamespace}Version`
    };
}
