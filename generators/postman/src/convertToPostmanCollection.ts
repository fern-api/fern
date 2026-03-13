import { isNonNullish } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    PostmanCollectionEndpointItem,
    PostmanCollectionItem,
    PostmanCollectionSchema,
    PostmanHeader
} from "@fern-fern/postman-sdk/api";
import { startCase } from "lodash";

import { convertAuth, getAuthHeaders, getVariablesForAuthScheme } from "./auth.js";
import { convertExampleEndpointCall } from "./convertExampleEndpointCall.js";
import { GeneratedExampleRequest } from "./request/GeneratedExampleRequest.js";
import { ORIGIN_VARIABLE_NAME } from "./utils.js";

export function convertToPostmanCollection({
    ir,
    collectionName,
    collectionDescription
}: {
    ir: FernIr.IntermediateRepresentation;
    collectionName: string;
    collectionDescription: string | undefined;
}): PostmanCollectionSchema {
    const authSchemes = filterAuthSchemes(ir.auth);
    const authHeaders = getAuthHeaders(authSchemes);

    return {
        info: {
            name: collectionName,
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
            description: collectionDescription ?? ir.apiDocs ?? undefined
        },
        variable: [
            {
                key: ORIGIN_VARIABLE_NAME,
                value: getOriginaVariableValue(ir),
                type: "string"
            },
            ...authSchemes.flatMap(getVariablesForAuthScheme)
        ],
        auth: convertAuth(authSchemes),
        item: getCollectionItems({ ir, authHeaders })
    };
}

function getOriginaVariableValue(ir: FernIr.IntermediateRepresentation): string {
    if (ir.environments?.environments.type === "singleBaseUrl") {
        if (ir.environments.defaultEnvironment != null) {
            const defaultEnvironment = ir.environments.environments.environments.find(
                (env) => env.id === ir.environments?.defaultEnvironment
            );
            if (defaultEnvironment == null) {
                throw new Error("Environment does not exist: " + ir.environments.defaultEnvironment);
            }
            return defaultEnvironment.url;
        }
        const firstEnvironment = ir.environments.environments.environments[0];
        if (firstEnvironment != null) {
            return firstEnvironment.url;
        }
    }

    return "";
}

function filterAuthSchemes(auth: FernIr.ApiAuth): FernIr.AuthScheme[] {
    let hasSeenAuthorizationHeader = false;
    return auth.schemes.filter((scheme) => {
        return FernIr.AuthScheme._visit(scheme, {
            basic: () => {
                if (hasSeenAuthorizationHeader) {
                    return false;
                }
                return (hasSeenAuthorizationHeader = true);
            },
            bearer: () => {
                if (hasSeenAuthorizationHeader) {
                    return false;
                }
                return (hasSeenAuthorizationHeader = true);
            },
            oauth: () => {
                if (hasSeenAuthorizationHeader) {
                    return false;
                }
                return (hasSeenAuthorizationHeader = true);
            },
            header: () => true,
            _other: () => {
                throw new Error("Unknown auth scheme: " + scheme.type);
            }
        });
    });
}

function getCollectionItems({
    ir,
    authHeaders
}: {
    ir: FernIr.IntermediateRepresentation;
    authHeaders: PostmanHeader[];
}): PostmanCollectionItem[] {
    return getCollectionItemsForPackage(ir.rootPackage, ir, authHeaders);
}

function getCollectionItemsForPackage(
    package_: FernIr.Package,
    ir: FernIr.IntermediateRepresentation,
    authHeaders: PostmanHeader[]
): PostmanCollectionItem[] {
    const items: PostmanCollectionItem[] = [];

    for (const subpackageId of package_.subpackages) {
        const subpackage = ir.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error("Subpackage does not exist: " + subpackageId);
        }
        if (subpackage.hasEndpointsInTree) {
            const service = subpackage.service != null ? ir.services[subpackage.service] : undefined;
            items.push({
                type: "container",
                description: subpackage.docs ?? undefined,
                name: service?.displayName ?? startCase(subpackage.name.originalName),
                item: getCollectionItemsForPackage(subpackage, ir, authHeaders)
            });
        }
    }

    if (package_.service != null) {
        const service = ir.services[package_.service];
        if (service == null) {
            throw new Error("Service does not exist: " + package_.service);
        }
        items.push(
            ...service.endpoints
                .map((httpEndpoint): PostmanCollectionItem.Endpoint | undefined => {
                    const convertedEndpoint = convertEndpoint({
                        ir,
                        authHeaders,
                        httpEndpoint,
                        httpService: service,
                        allTypes: Object.values(ir.types),
                        allErrors: Object.values(ir.errors)
                    });
                    if (convertedEndpoint != null) {
                        return {
                            type: "endpoint",
                            ...convertedEndpoint
                        };
                    }
                    return undefined;
                })
                .filter(isNonNullish)
        );
    }

    return items;
}

function convertEndpoint({
    ir,
    authHeaders,
    httpEndpoint,
    httpService,
    allTypes,
    allErrors
}: {
    ir: FernIr.IntermediateRepresentation;
    authHeaders: PostmanHeader[];
    httpEndpoint: FernIr.HttpEndpoint;
    httpService: FernIr.HttpService;
    allTypes: FernIr.TypeDeclaration[];
    allErrors: FernIr.ErrorDeclaration[];
}): PostmanCollectionEndpointItem | undefined {
    const example = httpEndpoint.userSpecifiedExamples[0]?.example ?? httpEndpoint.autogeneratedExamples[0]?.example;

    if (example == null) {
        return undefined;
    }

    return {
        name: httpEndpoint.displayName ?? startCase(httpEndpoint.name.originalName),
        request: new GeneratedExampleRequest({ authHeaders, httpService, httpEndpoint, allTypes, example, ir }).get(),
        response: [...httpEndpoint.userSpecifiedExamples, ...httpEndpoint.autogeneratedExamples]
            .map((example) => example.example)
            .filter(isNonNullish)
            .map((example) =>
                convertExampleEndpointCall({
                    ir,
                    authHeaders,
                    httpService,
                    httpEndpoint,
                    allTypes,
                    allErrors,
                    example
                })
            )
    };
}
