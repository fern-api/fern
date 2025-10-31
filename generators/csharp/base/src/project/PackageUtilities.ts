import { camelCase, upperFirst } from "lodash-es";

export function getPackageName(
    organization: string,
    apiName: string,
    clientClassName?: string,
    packageNameOverride?: string
): string {
    return packageNameOverride ?? upperFirst(camelCase(getClientName(organization, apiName, clientClassName)));
}

export function getClientName(organization: string, apiName: string, clientClassName?: string): string {
    return clientClassName ?? `${upperFirst(camelCase(organization))}${upperFirst(camelCase(apiName))}Client`;
}
