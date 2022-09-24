import { RelativeFilePath } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { ContainerType, DeclaredTypeName, PrimitiveType } from "@fern-fern/ir-model/types";

export declare type ResolvedType =
    | ResolvedType.Container
    | ResolvedType.Named
    | ResolvedType.Primitive
    | ResolvedType.Unknown;

export declare namespace ResolvedType {
    interface Container {
        _type: "container";
        container: ContainerType;
    }

    interface Named {
        _type: "named";
        name: DeclaredTypeName;
        declaration: RawSchemas.ObjectSchema | RawSchemas.UnionSchema | RawSchemas.EnumSchema;
        filepath: RelativeFilePath;
        // this is the breadcrumbs path to the final declaration, including intermediate aliases
        objectPath: string[];
    }

    interface Primitive {
        _type: "primitive";
        primitive: PrimitiveType;
    }

    interface Unknown {
        _type: "unknown";
    }
}
