import { FernIr } from "@fern-api/ir-sdk";
import { constructHttpPath } from "@fern-api/ir-utils";
import { GraphQLField, GraphQLSchema } from "graphql";

import { generateSelectionQuery, QueryGenerationConfig } from "../query-generation/generateSelectionQuery.js";
import { convertInputTypeToTypeReference, convertOutputTypeToTypeReference } from "./convertGraphQLTypes.js";
import { graphqlCasingsGenerator } from "./shared.js";

const GRAPHQL_PATH = "/graphql";

type OperationType = "QUERY" | "MUTATION" | "SUBSCRIPTION";

function toLowerOperationType(operationType: OperationType): "query" | "mutation" | "subscription" {
    switch (operationType) {
        case "QUERY":
            return "query";
        case "MUTATION":
            return "mutation";
        case "SUBSCRIPTION":
            return "subscription";
    }
}

function toGraphqlOperationType(operationType: OperationType): FernIr.GraphqlOperationType {
    switch (operationType) {
        case "QUERY":
            return FernIr.GraphqlOperationType.Query;
        case "MUTATION":
            return FernIr.GraphqlOperationType.Mutation;
        case "SUBSCRIPTION":
            return FernIr.GraphqlOperationType.Subscription;
    }
}

function pascalCase(value: string): string {
    if (value.length === 0) {
        return value;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Converts a single GraphQL root field into a synthetic HttpEndpoint for the IR.
 */
export function convertRootFieldToEndpoint({
    field,
    operationType,
    schema,
    namespace,
    config
}: {
    field: GraphQLField<unknown, unknown>;
    operationType: OperationType;
    schema: GraphQLSchema;
    namespace: string | undefined;
    config: QueryGenerationConfig;
}): FernIr.HttpEndpoint {
    const query = generateSelectionQuery(field, schema, toLowerOperationType(operationType), config);

    const requestBodyProperties: FernIr.InlinedRequestBodyProperty[] = field.args.map((arg) => ({
        name: graphqlCasingsGenerator.generateNameAndWireValue({ name: arg.name, wireValue: arg.name }),
        valueType: convertInputTypeToTypeReference(arg.type, namespace),
        defaultValue: undefined,
        v2Examples: undefined,
        propertyAccess: undefined,
        docs: arg.description ?? undefined,
        availability: undefined
    }));

    const hasRequestBody = field.args.length > 0;
    // Shared name for both the inlined request body type and the SDK request wrapper, so
    // the generated `${Field}Request` wrapper interface lines up with the request parameter.
    const requestWrapperName = graphqlCasingsGenerator.generateName(`${pascalCase(field.name)}Request`);

    const requestBody: FernIr.HttpRequestBody | undefined = hasRequestBody
        ? FernIr.HttpRequestBody.inlinedRequestBody({
              name: requestWrapperName,
              extends: [],
              properties: requestBodyProperties,
              extendedProperties: undefined,
              extraProperties: false,
              contentType: undefined,
              docs: undefined,
              v2Examples: undefined
          })
        : undefined;

    // A wrapper SdkRequest is what makes the generator emit a `request` parameter on the
    // method; its serialized value becomes the GraphQL `variables` object at runtime.
    const sdkRequest: FernIr.SdkRequest | undefined = hasRequestBody
        ? {
              shape: FernIr.SdkRequestShape.wrapper({
                  wrapperName: requestWrapperName,
                  bodyKey: graphqlCasingsGenerator.generateName("body"),
                  includePathParameters: false,
                  onlyPathParameters: false
              }),
              requestParameterName: graphqlCasingsGenerator.generateName("request"),
              streamParameter: undefined
          }
        : undefined;

    const responseBodyType = convertOutputTypeToTypeReference(field.type, namespace);
    const response: FernIr.HttpResponse = {
        docs: undefined,
        statusCode: undefined,
        isWildcardStatusCode: undefined,
        body: FernIr.HttpResponseBody.json(
            FernIr.JsonResponse.response({
                responseBodyType,
                docs: field.description ?? undefined,
                v2Examples: undefined
            })
        )
    };

    const path = constructHttpPath(GRAPHQL_PATH);

    return {
        id: `endpoint_${toLowerOperationType(operationType)}_${field.name}`,
        name: graphqlCasingsGenerator.generateName(field.name),
        displayName: undefined,
        subtitle: undefined,
        method: FernIr.HttpMethod.Post,
        headers: [],
        responseHeaders: [],
        baseUrl: undefined,
        v2BaseUrls: undefined,
        basePath: undefined,
        path,
        fullPath: path,
        pathParameters: [],
        allPathParameters: [],
        queryParameters: [],
        requestBody,
        v2RequestBodies: undefined,
        sdkRequest,
        response,
        v2Responses: undefined,
        errors: [],
        auth: false,
        security: undefined,
        idempotent: false,
        pagination: undefined,
        userSpecifiedExamples: [],
        autogeneratedExamples: [],
        v2Examples: undefined,
        transport: FernIr.Transport.graphql({
            query,
            operationType: toGraphqlOperationType(operationType),
            operationName: field.name
        }),
        source: undefined,
        audiences: undefined,
        retries: undefined,
        apiPlayground: undefined,
        docs: field.description ?? undefined,
        availability: undefined
    };
}
