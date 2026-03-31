import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode, TypeReferenceNode } from "@fern-typescript/commons";
import { BaseContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export declare namespace AbstractTypeReferenceConverter {
    export interface Init {
        context: BaseContext;
        treatUnknownAsAny: boolean;
        includeSerdeLayer: boolean;
        useBigInt: boolean;
        enableInlineTypes: boolean;
        allowExtraFields: boolean;
        omitUndefined: boolean;
        generateReadWriteOnlyTypes: boolean;
    }
}

export type ConvertTypeReferenceParams =
    | ConvertTypeReferenceParams.DefaultParams
    | ConvertTypeReferenceParams.InlinePropertyTypeParams
    | ConvertTypeReferenceParams.InlineAliasTypeParams
    | ConvertTypeReferenceParams.ForInlineUnionTypeParams;

export namespace ConvertTypeReferenceParams {
    export function isInlinePropertyParams(params: ConvertTypeReferenceParams): params is InlinePropertyTypeParams {
        return params.type === "inlinePropertyParams";
    }
    export function isInlineAliasParams(params: ConvertTypeReferenceParams): params is InlineAliasTypeParams {
        return params.type === "inlineAliasParams";
    }
    export function isForInlineUnionParams(params: ConvertTypeReferenceParams): params is ForInlineUnionTypeParams {
        return params.type === "forInlineUnionParams";
    }
    export function hasGenericIn(
        params: ConvertTypeReferenceParams
    ): params is InlinePropertyTypeParams | InlineAliasTypeParams {
        return isInlinePropertyParams(params) || isInlineAliasParams(params);
    }

    export interface DefaultParams extends WithTypeReference, WithNullable, WithOptional {
        type?: undefined;
    }

    /**
     * Metadata for converting inline types
     */
    export interface InlinePropertyTypeParams extends WithGenericIn, WithTypeReference, WithNullable, WithOptional {
        type: "inlinePropertyParams";
        parentTypeName: string;
        propertyName: string;
    }

    export interface InlineAliasTypeParams extends WithGenericIn, WithTypeReference, WithNullable, WithOptional {
        type: "inlineAliasParams";
        aliasTypeName: string;
    }

    export interface ForInlineUnionTypeParams extends WithTypeReference, WithNullable, WithOptional {
        type: "forInlineUnionParams";
    }

    export interface WithGenericIn {
        genericIn?: GenericIn;
    }

    export interface WithTypeReference {
        typeReference: FernIr.TypeReference;
    }

    export interface WithNullable {
        nullable?: boolean;
    }

    export interface WithOptional {
        optional?: boolean;
    }

    export const GenericIn = {
        List: "list",
        Map: "map",
        Set: "set"
    } as const;
    export type GenericIn = (typeof GenericIn)[keyof typeof GenericIn];
}

const genericIn = ConvertTypeReferenceParams.GenericIn;

export abstract class AbstractTypeReferenceConverter<T> {
    protected context: BaseContext;
    protected treatUnknownAsAny: boolean;
    protected includeSerdeLayer: boolean;
    protected useBigInt: boolean;
    protected enableInlineTypes: boolean;
    protected allowExtraFields: boolean;
    protected omitUndefined: boolean;
    protected generateReadWriteOnlyTypes: boolean;

    constructor({
        context,
        treatUnknownAsAny,
        includeSerdeLayer,
        useBigInt,
        enableInlineTypes,
        allowExtraFields,
        omitUndefined,
        generateReadWriteOnlyTypes
    }: AbstractTypeReferenceConverter.Init) {
        this.context = context;
        this.treatUnknownAsAny = treatUnknownAsAny;
        this.includeSerdeLayer = includeSerdeLayer;
        this.useBigInt = useBigInt;
        this.enableInlineTypes = enableInlineTypes;
        this.allowExtraFields = allowExtraFields;
        this.omitUndefined = omitUndefined;
        this.generateReadWriteOnlyTypes = generateReadWriteOnlyTypes;
    }

    public convert(params: ConvertTypeReferenceParams): T {
        return FernIr.TypeReference._visit<T>(params.typeReference, {
            named: (type) => this.named(type, params),
            primitive: (type) => this.primitive(type, params),
            container: (type) => this.container(type, params),
            unknown: () => (this.treatUnknownAsAny ? this.any() : this.unknown()),
            _other: () => {
                throw new Error("Unexpected type reference: " + params.typeReference.type);
            }
        });
    }

    protected container(container: FernIr.ContainerType, params: ConvertTypeReferenceParams): T {
        return FernIr.ContainerType._visit<T>(container, {
            map: (type) => this.map(type, setGenericIn(params, genericIn.Map)),
            list: (type) => this.list(type, setGenericIn(params, genericIn.List)),
            set: (type) => this.set(type, setGenericIn(params, genericIn.Set)),
            nullable: (type) => this.nullable(type, params),
            optional: (type) => this.optional(type, params),
            literal: (type) => this.literal(type, params),
            _other: () => {
                throw new Error("Unexpected container type: " + container.type);
            }
        });
    }

    protected abstract named(typeName: FernIr.DeclaredTypeName, params: ConvertTypeReferenceParams): T;
    protected abstract string(): T;
    protected abstract number(params: ConvertTypeReferenceParams): T;
    protected abstract long(params: ConvertTypeReferenceParams): T;
    protected abstract bigInteger(params: ConvertTypeReferenceParams): T;
    protected abstract boolean(params: ConvertTypeReferenceParams): T;
    protected abstract dateTime(params: ConvertTypeReferenceParams): T;
    protected abstract list(itemType: FernIr.TypeReference, params: ConvertTypeReferenceParams): T;
    protected abstract set(itemType: FernIr.TypeReference, params: ConvertTypeReferenceParams): T;
    protected abstract nullable(itemType: FernIr.TypeReference, params: ConvertTypeReferenceParams): T;
    protected abstract optional(itemType: FernIr.TypeReference, params: ConvertTypeReferenceParams): T;
    protected abstract literal(literal: FernIr.Literal, params: ConvertTypeReferenceParams): T;
    protected abstract unknown(): T;
    protected abstract any(): T;

    protected primitive(primitive: FernIr.PrimitiveType, params: ConvertTypeReferenceParams): T {
        return FernIr.PrimitiveTypeV1._visit<T>(primitive.v1, {
            boolean: () => this.boolean(params),
            double: () => this.number(params),
            integer: () => this.number(params),
            long: () => this.long(params),
            float: () => this.number(params),
            uint: () => this.number(params),
            uint64: () => this.number(params),
            string: this.string.bind(this),
            uuid: this.string.bind(this),
            dateTime: () => this.dateTime(params),
            date: this.string.bind(this),
            base64: this.string.bind(this),
            bigInteger: () => this.bigInteger(params),
            _other: () => {
                throw new Error("Unexpected primitive type: " + primitive.v1);
            }
        });
    }

    protected map(mapType: FernIr.MapType, params: ConvertTypeReferenceParams): T {
        const resolvedKeyType = this.context.type.resolveTypeReference(mapType.keyType);
        if (resolvedKeyType.type === "named" && resolvedKeyType.shape === FernIr.ShapeType.Enum) {
            return this.mapWithEnumKeys(mapType, params);
        } else {
            return this.mapWithNonEnumKeys(mapType, params);
        }
    }

    protected abstract mapWithEnumKeys(mapType: FernIr.MapType, params: ConvertTypeReferenceParams): T;
    protected abstract mapWithNonEnumKeys(mapType: FernIr.MapType, params: ConvertTypeReferenceParams): T;

    protected isTypeReferencePrimitive(typeReference: FernIr.TypeReference): boolean {
        const resolvedType = this.context.type.resolveTypeReference(typeReference);
        if (resolvedType.type === "primitive") {
            return true;
        }
        if (resolvedType.type === "named" && resolvedType.shape === FernIr.ShapeType.Enum) {
            return true;
        }
        return false;
    }

    public isTypeReferenceOptional(typeReference: FernIr.TypeReference): boolean {
        return this.context.type.isOptional(typeReference);
    }

    public isTypeReferenceNullable(typeReference: FernIr.TypeReference): boolean {
        return this.context.type.isNullable(typeReference);
    }

    protected generateNonOptionalTypeReferenceNode({
        typeNode,
        requestTypeNode,
        responseTypeNode
    }: {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    }): TypeReferenceNode {
        return {
            isOptional: false,
            typeNode,
            typeNodeWithoutUndefined: typeNode,
            requestTypeNode: requestTypeNode,
            requestTypeNodeWithoutUndefined: requestTypeNode,
            responseTypeNode: responseTypeNode,
            responseTypeNodeWithoutUndefined: responseTypeNode
        };
    }

    protected addRequestToTypeNode(typeNode: ts.TypeNode): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createIdentifier(getTextOfTsNode(typeNode)),
                ts.factory.createIdentifier("Request")
            )
        );
    }

    protected addResponseToTypeNode(typeNode: ts.TypeNode): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createIdentifier(getTextOfTsNode(typeNode)),
                ts.factory.createIdentifier("Response")
            )
        );
    }
}

function setGenericIn(
    params: ConvertTypeReferenceParams,
    genericIn: ConvertTypeReferenceParams.GenericIn
): ConvertTypeReferenceParams {
    if (ConvertTypeReferenceParams.hasGenericIn(params)) {
        params = {
            ...params,
            genericIn
        };
    }
    return params;
}
