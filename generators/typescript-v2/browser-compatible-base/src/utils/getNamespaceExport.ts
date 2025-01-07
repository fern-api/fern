import { camelCase, upperFirst } from "lodash-es";

export function getNamespaceExport({
    organization,
    workspaceName,
    namespaceExport
}: {
    organization: string;
    workspaceName: string;
    namespaceExport?: string;
}): string {
    return namespaceExport ?? `${upperFirst(camelCase(organization))}${upperFirst(camelCase(workspaceName))}`;
}
