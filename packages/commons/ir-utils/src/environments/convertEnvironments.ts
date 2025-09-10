import { CasingsGenerator } from "@fern-api/casings-generator";
import { RawSchemas, visitRawEnvironmentDeclaration } from "@fern-api/fern-definition-schema";
import {
    Environments,
    EnvironmentsConfig,
    MultipleBaseUrlsEnvironment,
    MultipleBaseUrlsEnvironments,
    SingleBaseUrlEnvironment,
    SingleBaseUrlEnvironments
} from "@fern-api/ir-sdk";
import { mapValues } from "lodash-es";

export function convertEnvironments({
    rawApiFileSchema: { "default-environment": defaultEnvironment, environments },
    casingsGenerator
}: {
    rawApiFileSchema: RawSchemas.WithEnvironmentsSchema;
    casingsGenerator: CasingsGenerator;
}): { environmentsConfig: EnvironmentsConfig; audiences: Record<string, string[]> } | undefined {
    if (environments == null) {
        return undefined;
    }
    const firstEnvironment = Object.values(environments)[0];
    if (firstEnvironment == null) {
        return undefined;
    }

    return {
        environmentsConfig: {
            defaultEnvironment: defaultEnvironment ?? undefined,
            environments: visitRawEnvironmentDeclaration<Environments>(firstEnvironment, {
                singleBaseUrl: () =>
                    Environments.singleBaseUrl(convertSingleBaseUrlEnvironments({ environments, casingsGenerator })),
                multipleBaseUrls: (firstMultipleBaseUrlsEnvironment) =>
                    Environments.multipleBaseUrls(
                        convertMultipleBaseUrlEnvironments({
                            baseUrls: Object.keys(firstMultipleBaseUrlsEnvironment.urls),
                            environments,
                            casingsGenerator
                        })
                    )
            })
        },
        audiences: {
            ...Object.fromEntries(
                Object.entries(environments).map(([environmentName, rawEnvironment]) => [
                    environmentName,
                    visitRawEnvironmentDeclaration(rawEnvironment, {
                        singleBaseUrl: (env) => [...(typeof env === "string" ? [] : (env.audiences ?? []))],
                        multipleBaseUrls: (env) => [...(env.audiences ?? [])]
                    })
                ])
            )
        }
    };
}

function convertSingleBaseUrlEnvironments({
    environments,
    casingsGenerator
}: {
    environments: Record<string, RawSchemas.EnvironmentSchema>;
    casingsGenerator: CasingsGenerator;
}): SingleBaseUrlEnvironments {
    return {
        environments: Object.entries(environments).map(
            ([environmentName, rawEnvironment]): SingleBaseUrlEnvironment =>
                visitRawEnvironmentDeclaration(rawEnvironment, {
                    singleBaseUrl: (singleBaseUrlEnvironment) => ({
                        docs: typeof singleBaseUrlEnvironment === "string" ? undefined : singleBaseUrlEnvironment.docs,
                        id: environmentName,
                        name: casingsGenerator.generateName(environmentName),
                        url: removeTrailingSlash(
                            typeof singleBaseUrlEnvironment === "string"
                                ? singleBaseUrlEnvironment
                                : singleBaseUrlEnvironment.url
                        )
                    }),
                    multipleBaseUrls: () => {
                        throw new Error(`Environment ${environmentName} has multiple base URLs`);
                    }
                })
        )
    };
}

function convertMultipleBaseUrlEnvironments({
    baseUrls,
    environments,
    casingsGenerator
}: {
    baseUrls: string[];
    environments: Record<string, RawSchemas.EnvironmentSchema>;
    casingsGenerator: CasingsGenerator;
}): MultipleBaseUrlsEnvironments {
    return {
        baseUrls: baseUrls.map((baseUrl) => ({
            id: baseUrl,
            name: casingsGenerator.generateName(baseUrl)
        })),
        environments: Object.entries(environments).map(
            ([environmentName, rawEnvironment]): MultipleBaseUrlsEnvironment =>
                visitRawEnvironmentDeclaration<MultipleBaseUrlsEnvironment>(rawEnvironment, {
                    multipleBaseUrls: (multipleBaseUrlsEnvironment): MultipleBaseUrlsEnvironment => ({
                        docs: multipleBaseUrlsEnvironment.docs,
                        id: environmentName,
                        name: casingsGenerator.generateName(environmentName),
                        urls: mapValues(multipleBaseUrlsEnvironment.urls, (url) => removeTrailingSlash(url))
                    }),
                    singleBaseUrl: () => {
                        throw new Error(`Environment ${environmentName} does not have multiple base URLs`);
                    }
                })
        )
    };
}

function removeTrailingSlash(url: string): string {
    return url.endsWith("/") ? url.slice(0, -1) : url;
}
