import { RelativeFilePath } from "@fern-api/fs-utils";
import { DeclaredTypeName, Literal as IrLiteral, PrimitiveType, TypeReference } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../FernFileContext";

export declare type ResolvedType =
    | ResolvedType.Container
    | ResolvedType.Named
    | ResolvedType.Primitive
    | ResolvedType.Unknown;

export declare namespace ResolvedType {
    interface Container {
        _type: "container";
        container: ResolvedContainerType;
        originalTypeReference: TypeReference.Container;
    }

    interface Named {
        _type: "named";
        rawName: string;
        name: DeclaredTypeName;
        declaration:
            | RawSchemas.ObjectSchema
            | RawSchemas.DiscriminatedUnionSchema
            | RawSchemas.UndiscriminatedUnionSchema
            | RawSchemas.EnumSchema;
        filepath: RelativeFilePath;
        file: FernFileContext;
        // this is the breadcrumbs path to the final declaration, including intermediate aliases
        objectPath: ObjectPathItem[];
        originalTypeReference: TypeReference.Named;
    }

    interface Primitive {
        _type: "primitive";
        primitive: PrimitiveType;
        originalTypeReference: TypeReference.Primitive;
    }

    interface Unknown {
        _type: "unknown";
        originalTypeReference: TypeReference.Unknown;
    }
}

export declare type ResolvedContainerType =
    | ResolvedContainerType.Map
    | ResolvedContainerType.List
    | ResolvedContainerType.Optional
    | ResolvedContainerType.Set
    | ResolvedContainerType.Literal;

export declare namespace ResolvedContainerType {
    interface Map {
        _type: "map";
        keyType: ResolvedType;
        valueType: ResolvedType;
    }

    interface List {
        _type: "list";
        itemType: ResolvedType;
    }

    interface Optional {
        _type: "optional";
        itemType: ResolvedType;
    }

    interface Set {
        _type: "set";
        itemType: ResolvedType;
    }

    interface Literal {
        _type: "literal";
        literal: IrLiteral;
    }
}

export function isNamedType(type: ResolvedType): type is ResolvedType.Named {
    return type._type === "named";
}

export function isContainerType(type: ResolvedType): type is ResolvedType.Container {
    return type._type === "container";
}

export function isPrimitiveType(type: ResolvedType): type is ResolvedType.Primitive {
    return type._type === "primitive";
}

export function isUnknownType(type: ResolvedType): type is ResolvedType.Unknown {
    return type._type === "unknown";
}

export function isMapType(type: ResolvedContainerType): type is ResolvedContainerType.Map {
    return type._type === "map";
}

export function isListType(type: ResolvedContainerType): type is ResolvedContainerType.List {
    return type._type === "list";
}

export function isOptionalType(type: ResolvedContainerType): type is ResolvedContainerType.Optional {
    return type._type === "optional";
}

export function isSetType(type: ResolvedContainerType): type is ResolvedContainerType.Set {
    return type._type === "set";
}

export function isLiteralType(type: ResolvedContainerType): type is ResolvedContainerType.Literal {
    return type._type === "literal";
}

export interface ObjectPathItem {
    file: RelativeFilePath;
    typeName: string;
    // the original reference in the source file, could be `typeName` or `importedFile.typeName`
    reference: string;
}
