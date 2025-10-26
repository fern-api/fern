import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInterfaceType,
    GraphQLUnionType,
    GraphQLEnumType,
    GraphQLInputObjectType,
    GraphQLField,
    GraphQLInputField,
    GraphQLNamedType,
    isObjectType,
    isInterfaceType,
    isUnionType,
    isEnumType,
    isInputObjectType,
    isScalarType,
    isListType,
    isNonNullType,
    GraphQLOutputType,
    GraphQLInputType,
    GraphQLType,
} from "graphql";
import { CasingsGenerator } from "@fern-api/casings-generator";
import * as Ir from "@fern-api/ir-sdk";
import { IdGenerator } from "@fern-api/ir-utils";

function createDeclaredTypeName(typeName: string, casingsGenerator: CasingsGenerator): Ir.DeclaredTypeName {
    const fernFilepath: Ir.FernFilepath = {
        allParts: [],
        file: undefined,
        packagePath: [],
    };
    const name = casingsGenerator.generateName(typeName);
    const declaredTypeNameWithoutId: Omit<Ir.DeclaredTypeName, "typeId"> = {
        fernFilepath,
        name,
        displayName: undefined,
    };
    const typeId = IdGenerator.generateTypeId(declaredTypeNameWithoutId);
    return {
        typeId,
        fernFilepath,
        name,
        displayName: undefined,
    };
}

export interface ParsedGraphQLSchema {
    queries: Ir.graphql.GraphQlOperation[];
    mutations: Ir.graphql.GraphQlOperation[];
    subscriptions: Ir.graphql.GraphQlSubscription[];
    types: Record<string, Ir.graphql.GraphQlTypeDeclaration>;
}

export function convertGraphQLSchemaToIR(
    schema: GraphQLSchema,
    casingsGenerator: CasingsGenerator
): ParsedGraphQLSchema {
    const queryType = schema.getQueryType();
    const mutationType = schema.getMutationType();
    const subscriptionType = schema.getSubscriptionType();

    const typeMap = schema.getTypeMap();
    const customTypes: Record<string, Ir.graphql.GraphQlTypeDeclaration> = {};

    for (const [typeName, type] of Object.entries(typeMap)) {
        if (typeName.startsWith("__")) {
            continue;
        }
        if (type === queryType || type === mutationType || type === subscriptionType) {
            continue;
        }
        if (isScalarType(type) && ["String", "Int", "Float", "Boolean", "ID"].includes(typeName)) {
            continue;
        }

        const convertedType = convertGraphQLType(type, casingsGenerator);
        if (convertedType != null) {
            customTypes[typeName] = convertedType;
        }
    }

    return {
        queries: queryType ? convertOperations(queryType, Ir.graphql.GraphQlOperationType.Query, casingsGenerator) : [],
        mutations: mutationType
            ? convertOperations(mutationType, Ir.graphql.GraphQlOperationType.Mutation, casingsGenerator)
            : [],
        subscriptions: subscriptionType
            ? convertSubscriptions(subscriptionType, casingsGenerator)
            : [],
        types: customTypes,
    };
}

function convertOperations(
    type: GraphQLObjectType,
    operationType: Ir.graphql.GraphQlOperationType,
    casingsGenerator: CasingsGenerator
): Ir.graphql.GraphQlOperation[] {
    const fields = type.getFields();
    const operations: Ir.graphql.GraphQlOperation[] = [];

    for (const [fieldName, field] of Object.entries(fields)) {
        operations.push({
            id: fieldName,
            name: casingsGenerator.generateName(fieldName),
            displayName: undefined,
            operationType,
            arguments: convertArguments(field, casingsGenerator),
            returnType: convertOutputType(field.type, casingsGenerator),
            docs: field.description ?? undefined,
            deprecationReason: field.deprecationReason ?? undefined,
            availability: undefined,
        });
    }

    return operations;
}

function convertSubscriptions(
    type: GraphQLObjectType,
    casingsGenerator: CasingsGenerator
): Ir.graphql.GraphQlSubscription[] {
    const fields = type.getFields();
    const subscriptions: Ir.graphql.GraphQlSubscription[] = [];

    for (const [fieldName, field] of Object.entries(fields)) {
        subscriptions.push({
            id: fieldName,
            name: casingsGenerator.generateName(fieldName),
            displayName: undefined,
            operationType: Ir.graphql.GraphQlOperationType.Subscription,
            arguments: convertArguments(field, casingsGenerator),
            returnType: convertOutputType(field.type, casingsGenerator),
            docs: field.description ?? undefined,
            deprecationReason: field.deprecationReason ?? undefined,
            availability: undefined,
            subscriptionProtocol: undefined,
        });
    }

    return subscriptions;
}

function convertArguments(
    field: GraphQLField<unknown, unknown>,
    casingsGenerator: CasingsGenerator
): Ir.graphql.GraphQlArgument[] {
    return field.args.map((arg) => ({
        name: casingsGenerator.generateNameAndWireValue({
            name: arg.name,
            wireValue: arg.name,
        }),
        valueType: convertInputType(arg.type, casingsGenerator),
        defaultValue: arg.defaultValue,
        isRequired: isNonNullType(arg.type),
        docs: arg.description ?? undefined,
        availability: undefined,
    }));
}

function convertGraphQLType(
    type: GraphQLNamedType,
    casingsGenerator: CasingsGenerator
): Ir.graphql.GraphQlTypeDeclaration | undefined {
    if (isObjectType(type)) {
        return Ir.graphql.GraphQlTypeDeclaration.object(convertObjectType(type, casingsGenerator));
    } else if (isInterfaceType(type)) {
        return Ir.graphql.GraphQlTypeDeclaration.interface(convertInterfaceType(type, casingsGenerator));
    } else if (isUnionType(type)) {
        return Ir.graphql.GraphQlTypeDeclaration.union(convertUnionType(type, casingsGenerator));
    } else if (isEnumType(type)) {
        return Ir.graphql.GraphQlTypeDeclaration.enum(convertEnumType(type, casingsGenerator));
    } else if (isInputObjectType(type)) {
        return Ir.graphql.GraphQlTypeDeclaration.inputObject(convertInputObjectType(type, casingsGenerator));
    }
    return undefined;
}

function convertObjectType(
    type: GraphQLObjectType,
    casingsGenerator: CasingsGenerator
): Ir.graphql.GraphQlObjectType {
    const fields = type.getFields();
    return {
        name: createDeclaredTypeName(type.name, casingsGenerator),
        fields: Object.values(fields).map((field) => convertField(field, casingsGenerator)),
        interfaces: type.getInterfaces().map((iface) => iface.name),
        docs: type.description ?? undefined,
        availability: undefined,
    };
}

function convertInterfaceType(
    type: GraphQLInterfaceType,
    casingsGenerator: CasingsGenerator
): Ir.graphql.GraphQlInterfaceType {
    const fields = type.getFields();
    return {
        name: createDeclaredTypeName(type.name, casingsGenerator),
        fields: Object.values(fields).map((field) => convertField(field, casingsGenerator)),
        implementedBy: [],
        docs: type.description ?? undefined,
        availability: undefined,
    };
}

function convertUnionType(type: GraphQLUnionType, casingsGenerator: CasingsGenerator): Ir.graphql.GraphQlUnionType {
    return {
        name: createDeclaredTypeName(type.name, casingsGenerator),
        members: type.getTypes().map((memberType) => memberType.name),
        docs: type.description ?? undefined,
        availability: undefined,
    };
}

function convertEnumType(type: GraphQLEnumType, casingsGenerator: CasingsGenerator): Ir.graphql.GraphQlEnumType {
    return {
        name: createDeclaredTypeName(type.name, casingsGenerator),
        values: type.getValues().map((value) => ({
            name: casingsGenerator.generateNameAndWireValue({
                name: value.name,
                wireValue: value.value ?? value.name,
            }),
            docs: value.description ?? undefined,
            deprecationReason: value.deprecationReason ?? undefined,
            availability: undefined,
        })),
        docs: type.description ?? undefined,
        availability: undefined,
    };
}

function convertInputObjectType(
    type: GraphQLInputObjectType,
    casingsGenerator: CasingsGenerator
): Ir.graphql.GraphQlInputObjectType {
    const fields = type.getFields();
    return {
        name: createDeclaredTypeName(type.name, casingsGenerator),
        fields: Object.values(fields).map((field) => convertInputField(field, casingsGenerator)),
        docs: type.description ?? undefined,
        availability: undefined,
    };
}

function convertField(
    field: GraphQLField<unknown, unknown>,
    casingsGenerator: CasingsGenerator
): Ir.graphql.GraphQlField {
    return {
        name: casingsGenerator.generateNameAndWireValue({
            name: field.name,
            wireValue: field.name,
        }),
        valueType: convertOutputType(field.type, casingsGenerator),
        arguments: convertArguments(field, casingsGenerator),
        docs: field.description ?? undefined,
        deprecationReason: field.deprecationReason ?? undefined,
    };
}

function convertInputField(
    field: GraphQLInputField,
    casingsGenerator: CasingsGenerator
): Ir.graphql.GraphQlInputField {
    return {
        name: casingsGenerator.generateNameAndWireValue({
            name: field.name,
            wireValue: field.name,
        }),
        valueType: convertInputType(field.type, casingsGenerator),
        defaultValue: field.defaultValue,
        docs: field.description ?? undefined,
    };
}

function convertOutputType(type: GraphQLOutputType, casingsGenerator: CasingsGenerator): Ir.types.TypeReference {
    return convertTypeReference(type as GraphQLType, casingsGenerator);
}

function convertInputType(type: GraphQLInputType, casingsGenerator: CasingsGenerator): Ir.types.TypeReference {
    return convertTypeReference(type as GraphQLType, casingsGenerator);
}

function convertTypeReference(type: GraphQLType, casingsGenerator: CasingsGenerator): Ir.types.TypeReference {
    if (isNonNullType(type)) {
        return convertTypeReference(type.ofType, casingsGenerator);
    }

    if (isListType(type)) {
        return Ir.types.TypeReference.container(
            Ir.types.ContainerType.list(convertTypeReference(type.ofType, casingsGenerator))
        );
    }

    const typeName = type.toString();

    switch (typeName) {
        case "String":
            return Ir.types.TypeReference.primitive({ v1: "STRING", v2: undefined });
        case "Int":
            return Ir.types.TypeReference.primitive({ v1: "INTEGER", v2: undefined });
        case "Float":
            return Ir.types.TypeReference.primitive({ v1: "DOUBLE", v2: undefined });
        case "Boolean":
            return Ir.types.TypeReference.primitive({ v1: "BOOLEAN", v2: undefined });
        case "ID":
            return Ir.types.TypeReference.primitive({ v1: "STRING", v2: undefined });
        default: {
            const declaredTypeName = createDeclaredTypeName(typeName, casingsGenerator);
            return Ir.types.TypeReference.named({
                typeId: declaredTypeName.typeId,
                name: declaredTypeName.name,
                fernFilepath: declaredTypeName.fernFilepath,
                displayName: declaredTypeName.displayName,
                default: undefined,
                inline: undefined,
            });
        }
    }
}
