import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    constructFernFileContext,
    constructStreamCondition,
    ResolvedType,
    TypeResolverImpl,
} from "@fern-api/ir-generator";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import { StreamCondition } from "@fern-fern/ir-model/http";
import { PrimitiveType } from "@fern-fern/ir-model/types";
import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { getAllPropertiesForRequest } from "../../utils/getAllPropertiesForRequest";

export const ValidStreamConditionRule: Rule = {
    name: "valid-stream-condition",
    create: async ({ workspace }) => {
        return {
            definitionFile: {
                streamCondition: (
                    { endpoint, streamCondition: rawStreamCondition },
                    { relativeFilepath, contents }
                ) => {
                    if (endpoint.response == null || endpoint["response-stream"] == null) {
                        if (rawStreamCondition == null) {
                            return [];
                        }
                        return [
                            {
                                severity: "error",
                                message:
                                    "stream-condition can only be used if both response and response-stream are specified.",
                            },
                        ];
                    }

                    if (rawStreamCondition == null) {
                        return [
                            {
                                severity: "error",
                                message:
                                    "stream-condition must be specified when both response and response-stream are specified.",
                            },
                        ];
                    }

                    const streamCondition = constructStreamCondition(rawStreamCondition);
                    if (streamCondition == null) {
                        return [
                            {
                                severity: "error",
                                message:
                                    "stream-condition is not valid. You should specify a selector for a boolean request property, e.g. $request.yourProperty or $query.yourQueryParameter",
                            },
                        ];
                    }

                    return StreamCondition._visit(streamCondition, {
                        queryParameterKey: (queryParameterKey) => {
                            return validateQueryParameterKeyStreamCondition(
                                endpoint,
                                relativeFilepath,
                                contents,
                                queryParameterKey,
                                workspace
                            );
                        },
                        requestPropertyKey: (requestPropertyKey) => {
                            return validatePropertyKeyStreamCondition(
                                endpoint,
                                relativeFilepath,
                                contents,
                                workspace,
                                requestPropertyKey
                            );
                        },
                        _unknown: () => {
                            throw new Error("Unknown stream condition: " + streamCondition.type);
                        },
                    });
                },
            },
        };
    },
};

function isBooleanOrOptionalBoolean(resolvedType: ResolvedType): boolean {
    if (resolvedType._type === "primitive") {
        return resolvedType.primitive === PrimitiveType.Boolean;
    }
    return (
        resolvedType._type === "container" &&
        resolvedType.container._type === "optional" &&
        isBooleanOrOptionalBoolean(resolvedType.container.itemType)
    );
}

function validatePropertyKeyStreamCondition(
    endpoint: RawSchemas.HttpEndpointSchema,
    relativeFilepath: RelativeFilePath,
    definitionFile: RawSchemas.DefinitionFileSchema,
    workspace: FernWorkspace,
    requestPropertyKey: string
): RuleViolation[] {
    const properties = getAllPropertiesForRequest({
        endpoint,
        filepath: relativeFilepath,
        definitionFile,
        workspace,
    });

    if (properties == null) {
        return [
            {
                severity: "error",
                message: "A request body is required when the response can be either streaming or non-streaming.",
            },
        ];
    }

    const streamConditionProperty = properties.find((property) => property.wireKey === requestPropertyKey);

    if (streamConditionProperty == null) {
        return [
            {
                severity: "error",
                message: `Property "${requestPropertyKey}" does not exist on the request.`,
            },
        ];
    }

    if (!isBooleanOrOptionalBoolean(streamConditionProperty.resolvedPropertyType)) {
        return [
            {
                severity: "error",
                message: `Property "${requestPropertyKey}" is not a boolean.`,
            },
        ];
    }

    return [];
}

function getQueryParameterType(endpoint: RawSchemas.HttpEndpointSchema, queryParameterKey: string): string | undefined {
    if (endpoint.request == null || typeof endpoint.request === "string") {
        return undefined;
    }

    const type = endpoint.request["query-parameters"]?.[queryParameterKey];
    if (type == null || typeof type === "string") {
        return type;
    }

    return type.type;
}

function validateQueryParameterKeyStreamCondition(
    endpoint: RawSchemas.HttpEndpointSchema,
    relativeFilepath: RelativeFilePath,
    definitionFile: RawSchemas.DefinitionFileSchema,
    queryParameterKey: string,
    workspace: FernWorkspace
): RuleViolation[] {
    const queryParamType = getQueryParameterType(endpoint, queryParameterKey);

    if (queryParamType == null) {
        return [
            {
                severity: "error",
                message: `Query parameter "${queryParameterKey}" does not exist on this endpoint.`,
            },
        ];
    }

    const typeResolver = new TypeResolverImpl(workspace);
    const resolvedType = typeResolver.resolveType({
        type: queryParamType,
        file: constructFernFileContext({
            relativeFilepath,
            definitionFile,
            casingsGenerator: CASINGS_GENERATOR,
            rootApiFile: workspace.definition.rootApiFile.contents,
        }),
    });

    // invalid type
    // will be caught by another rule
    if (resolvedType == null) {
        return [];
    }

    if (!isBooleanOrOptionalBoolean(resolvedType)) {
        return [
            {
                severity: "error",
                message: `Query parameter "${queryParameterKey}" is not a boolean.`,
            },
        ];
    }

    return [];
}
