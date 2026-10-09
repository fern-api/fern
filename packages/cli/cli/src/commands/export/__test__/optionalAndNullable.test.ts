import { ContainerType, ObjectProperty, ResolvedTypeReference, TypeReference } from "@fern-api/ir-sdk";
import { describe, expect, it } from "vitest";

import { convertObject } from "../converters/convertObject.js";
import { convertAlias, convertTypeReference, convertUnion } from "../converters/typeConverter.js";

const STRING = TypeReference.primitive({ v1: "STRING", v2: undefined });

const ADDRESS = TypeReference.named({
    typeId: "type_:Address",
    fernFilepath: { allParts: [], packagePath: [], file: undefined },
    name: "Address",
    displayName: undefined,
    default: undefined,
    inline: undefined
});

function optional(typeReference: TypeReference): TypeReference {
    return TypeReference.container(ContainerType.optional(typeReference));
}

function nullable(typeReference: TypeReference): TypeReference {
    return TypeReference.container(ContainerType.nullable(typeReference));
}

function objectProperty(name: string, valueType: TypeReference): ObjectProperty {
    return {
        name,
        valueType,
        docs: undefined,
        availability: undefined,
        propertyAccess: undefined,
        defaultValue: undefined,
        v2Examples: undefined,
        xml: undefined
    };
}

describe("fern export optional and nullable", () => {
    it("carries optional in required and nullable in the schema for object properties", () => {
        const schema = convertObject({
            docs: undefined,
            extensions: [],
            properties: [
                { docs: undefined, name: "required", valueType: STRING },
                { docs: undefined, name: "optional", valueType: optional(STRING) },
                { docs: undefined, name: "nullable", valueType: nullable(STRING) },
                { docs: undefined, name: "optionalNullable", valueType: optional(nullable(STRING)) },
                { docs: undefined, name: "optionalReference", valueType: optional(ADDRESS) }
            ]
        });

        expect(schema).toEqual({
            type: "object",
            properties: {
                required: { type: "string" },
                optional: { type: "string" },
                nullable: { type: "string", nullable: true },
                optionalNullable: { type: "string", nullable: true },
                optionalReference: { $ref: "#/components/schemas/Address" }
            },
            required: ["required", "nullable"]
        });
    });

    it("does not mark optional union base properties nullable", () => {
        const schema = convertUnion({
            docs: undefined,
            unionTypeDeclaration: {
                discriminant: "type",
                extends: [],
                types: [],
                baseProperties: [objectProperty("id", STRING), objectProperty("note", optional(STRING))],
                inheritedBaseProperties: undefined,
                default: undefined,
                discriminatorContext: undefined
            }
        });

        expect(schema.properties).toEqual({
            id: { type: "string" },
            note: { type: "string" }
        });
        expect(schema.required).toEqual(["id"]);
    });

    it("keeps optional nullable where there is no required list to carry it", () => {
        expect(convertTypeReference(TypeReference.container(ContainerType.list(optional(STRING))))).toEqual({
            type: "array",
            items: { type: "string", nullable: true }
        });
        expect(
            convertTypeReference(
                TypeReference.container(ContainerType.map({ keyType: STRING, valueType: optional(STRING) }))
            )
        ).toEqual({
            type: "object",
            additionalProperties: { type: "string", nullable: true }
        });
        expect(convertTypeReference(optional(ADDRESS))).toEqual({
            $ref: "#/components/schemas/Address",
            nullable: true
        });
        expect(
            convertAlias({
                docs: undefined,
                aliasTypeDeclaration: {
                    aliasOf: optional(STRING),
                    resolvedType: ResolvedTypeReference.container(ContainerType.optional(STRING))
                }
            })
        ).toEqual({ type: "string", nullable: true });
    });
});
