import { ApiAuth, AuthScheme } from "@fern-fern/ir-model/auth";
import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation, Package } from "@fern-fern/ir-model/ir";
import { TypeDeclaration } from "@fern-fern/ir-model/types";
import {
    PostmanCollectionEndpointItem,
    PostmanCollectionItem,
    PostmanCollectionSchema,
    PostmanHeader,
} from "@fern-fern/postman-sdk/api";
import { startCase } from "lodash";
import { convertAuth, getAuthHeaders, getVariablesForAuthScheme } from "./auth";
import { convertExampleEndpointCall } from "./convertExampleEndpointCall";
import { GeneratedDummyRequest } from "./request/GeneratedDummyRequest";
import { GeneratedExampleRequest } from "./request/GeneratedExampleRequest";
import { ORIGIN_VARIABLE_NAME } from "./utils";

export function convertToPostmanCollection(ir: IntermediateRepresentation): PostmanCollectionSchema {
    const id = ir.apiName;

    const authSchemes = filterAuthSchemes(ir.auth);
    const authHeaders = getAuthHeaders(authSchemes);

    return {
        info: {
            name: ir.apiDisplayName ?? startCase(id.originalName),
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        variable: [
            {
                key: ORIGIN_VARIABLE_NAME,
                value: getOriginaVariableValue(ir),
                type: "string",
            },
            ...authSchemes.flatMap(getVariablesForAuthScheme),
        ],
        auth: convertAuth(authSchemes),
        item: getCollectionItems({ ir, authHeaders }),
    };
}

function getOriginaVariableValue(ir: IntermediateRepresentation): string {
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

function filterAuthSchemes(auth: ApiAuth): AuthScheme[] {
    let hasSeenAuthorizationHeader = false;
    return auth.schemes.filter((scheme) => {
        return AuthScheme._visit(scheme, {
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
            header: () => true,
            _unknown: () => {
                throw new Error("Unknown auth scheme: " + scheme._type);
            },
        });
    });
}

function getCollectionItems({
    ir,
    authHeaders,
}: {
    ir: IntermediateRepresentation;
    authHeaders: PostmanHeader[];
}): PostmanCollectionItem[] {
    return getCollectionItemsForPackage(ir.rootPackage, ir, authHeaders);
}

function getCollectionItemsForPackage(
    package_: Package,
    ir: IntermediateRepresentation,
    authHeaders: PostmanHeader[]
): PostmanCollectionItem[] {
    const items: PostmanCollectionItem[] = [];

    for (const subpackageId of package_.subpackages) {
        const subpackage = ir.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error("Subpackage does not exist: " + subpackageId);
        }
        items.push({
            type: "container",
            description: subpackage.docs ?? undefined,
            name: startCase(subpackage.name.originalName),
            item: getCollectionItemsForPackage(subpackage, ir, authHeaders),
        });
    }

    if (package_.service != null) {
        const service = ir.services[package_.service];
        if (service == null) {
            throw new Error("Service does not exist: " + package_.service);
        }
        items.push(
            ...service.endpoints.map(
                (httpEndpoint): PostmanCollectionItem.Endpoint => ({
                    type: "endpoint",
                    ...convertEndpoint({
                        authHeaders,
                        httpEndpoint,
                        httpService: service,
                        allTypes: Object.values(ir.types),
                        allErrors: Object.values(ir.errors),
                    }),
                })
            )
        );
    }

    return items;
}

function convertEndpoint({
    authHeaders,
    httpEndpoint,
    httpService,
    allTypes,
    allErrors,
}: {
    authHeaders: PostmanHeader[];
    httpEndpoint: HttpEndpoint;
    httpService: HttpService;
    allTypes: TypeDeclaration[];
    allErrors: ErrorDeclaration[];
}): PostmanCollectionEndpointItem {
    const example = httpEndpoint.examples[0];
    const generatedRequest =
        example != null
            ? new GeneratedExampleRequest({ authHeaders, httpService, httpEndpoint, allTypes, example })
            : new GeneratedDummyRequest({ authHeaders, httpService, httpEndpoint, allTypes });

    return {
        name: httpEndpoint.displayName ?? startCase(httpEndpoint.name.originalName),
        request: generatedRequest.get(),
        response: httpEndpoint.examples.map((example) =>
            convertExampleEndpointCall({ authHeaders, httpService, httpEndpoint, allTypes, allErrors, example })
        ),
    };
}
