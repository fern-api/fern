import { csharp } from "@fern-api/csharp-codegen";
import {
    ExampleContainer,
    ExampleNamedType,
    ExampleObjectType,
    ExamplePrimitive,
    ExampleTypeReference,
    ExampleUndiscriminatedUnionType,
    ExampleUnionType
} from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ObjectGenerator } from "../object/ObjectGenerator";

export class ExampleGenerator {
    private context: ModelGeneratorContext;

    constructor(context: ModelGeneratorContext) {
        this.context = context;
    }

    public getSnippetForTypeReference(
        exampleTypeReference: ExampleTypeReference,
        parsedDatetimes: boolean
    ): csharp.CodeBlock {
        const astNode = exampleTypeReference.shape._visit<csharp.AstNode>({
            primitive: (primitive) => this.getSnippetForPrimitive(primitive, parsedDatetimes),
            container: (container) => this.getSnippetForContainer(container, parsedDatetimes),
            unknown: (value) => this.getSnippetForUnknown(value),
            named: (named) => this.getSnippetForNamed(named, parsedDatetimes),
            _other: () => {
                throw new Error("Unknown example type reference: " + exampleTypeReference.shape.type);
            }
        });
        return csharp.codeblock((writer) => writer.writeNode(astNode));
    }

    private getSnippetForUnknown(unknownExample: unknown): csharp.AstNode {
        switch (typeof unknownExample) {
            case "boolean":
                return csharp.InstantiatedPrimitive.boolean(unknownExample);
            case "string":
                return csharp.InstantiatedPrimitive.string(unknownExample);
            case "number":
                return csharp.InstantiatedPrimitive.double(unknownExample);
            case "object":
                if (Array.isArray(unknownExample)) {
                    const values = unknownExample.map((value) => this.getSnippetForUnknown(value));
                    return csharp.list({ entries: values, itemType: csharp.Type.optional(csharp.Type.object()) });
                } else if (unknownExample != null && unknownExample instanceof Object) {
                    const keys = Object.keys(unknownExample).sort();
                    const entries = keys.map((key) => ({
                        key: csharp.InstantiatedPrimitive.string(key),
                        value: this.getSnippetForUnknown((unknownExample as Record<string, unknown>)[key])
                    }));
                    return csharp.dictionary({
                        keyType: csharp.Type.object(),
                        valueType: csharp.Type.optional(csharp.Type.object()),
                        values: {
                            type: "entries",
                            entries
                        }
                    });
                }
                break;
        }
        return csharp.InstantiatedPrimitive.null();
    }
    private getSnippetForNamed(exampleNamedType: ExampleNamedType, parsedDatetimes: boolean): csharp.AstNode {
        return exampleNamedType.shape._visit<csharp.AstNode>({
            alias: (exampleAliasType) => this.getSnippetForTypeReference(exampleAliasType.value, parsedDatetimes),
            enum: (exampleEnumType) =>
                csharp.enumInstantiation({
                    reference: this.context.csharpTypeMapper.convertToClassReference(exampleNamedType.typeName),
                    value: exampleEnumType.value.name.pascalCase.safeName
                }),
            object: (exampleObjectType) =>
                this.getSnippetForTypeId(exampleNamedType.typeName.typeId, exampleObjectType, parsedDatetimes),
            union: (exampleUnionType) => this.getSnippetForUnion(exampleUnionType, parsedDatetimes),
            undiscriminatedUnion: (exampleUndiscriminatedUnionType) =>
                this.getSnippetForUndiscriminatedUnion(exampleUndiscriminatedUnionType, parsedDatetimes),
            _other: () => {
                throw new Error("Unknown example type: " + exampleNamedType.shape.type);
            }
        });
    }

    private getSnippetForTypeId(
        typeId: string,
        exampleObjectType: ExampleObjectType,
        parsedDatetimes: boolean
    ): csharp.AstNode {
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(typeId);
        if (typeDeclaration.shape.type !== "object") {
            throw new Error("Unexpected non object in Example Generator");
        }
        return new ObjectGenerator(this.context, typeDeclaration, typeDeclaration.shape).doGenerateSnippet(
            exampleObjectType,
            parsedDatetimes
        );
    }

    private getSnippetForUndiscriminatedUnion(
        exampleUndiscriminatedUnionType: ExampleUndiscriminatedUnionType,
        parsedDatetimes: boolean
    ): csharp.AstNode {
        return this.getSnippetForTypeReference(exampleUndiscriminatedUnionType.singleUnionType, parsedDatetimes);
    }

    private getSnippetForUnion(p: ExampleUnionType, parsedDatetimes: boolean): csharp.AstNode {
        return p.singleUnionType.shape._visit<csharp.AstNode>({
            samePropertiesAsObject: (p) => this.getSnippetForTypeId(p.typeId, p.object, parsedDatetimes),
            singleProperty: (p) => this.getSnippetForTypeReference(p, parsedDatetimes),
            // todo: figure out what to put here
            noProperties: () => csharp.codeblock('"no-properties-union"'),
            _other: (value) => {
                throw new Error("Unknown example type reference: " + value.type);
            }
        });
    }

    private getSnippetForContainer(c: ExampleContainer, parsedDatetimes: boolean): csharp.AstNode {
        return c._visit<csharp.AstNode>({
            literal: (p) =>
                csharp.codeblock((writer) => writer.writeNode(this.getSnippetForPrimitive(p.literal, parsedDatetimes))),
            list: (p) => {
                const entries = p.list.map((exampleTypeReference) =>
                    this.getSnippetForTypeReference(exampleTypeReference, parsedDatetimes)
                );
                return csharp.list({
                    itemType: this.context.csharpTypeMapper.convert({
                        reference: p.itemType,
                        unboxOptionals: true
                    }),
                    entries
                });
            },
            set: (p) => {
                const entries = p.set.map((exampleTypeReference) =>
                    this.getSnippetForTypeReference(exampleTypeReference, parsedDatetimes)
                );
                return csharp.set({
                    itemType: this.context.csharpTypeMapper.convert({
                        reference: p.itemType,
                        unboxOptionals: true
                    }),
                    entries
                });
            },
            optional: (p) =>
                p.optional == null
                    ? csharp.InstantiatedPrimitive.null()
                    : this.getSnippetForTypeReference(p.optional, parsedDatetimes),
            map: (p) => {
                const entries = p.map.map((exampleKeyValuePair) => {
                    return {
                        key: this.getSnippetForTypeReference(exampleKeyValuePair.key, parsedDatetimes),
                        value: this.getSnippetForTypeReference(exampleKeyValuePair.value, parsedDatetimes)
                    };
                });
                return csharp.dictionary({
                    keyType: this.context.csharpTypeMapper.convert({ reference: p.keyType }),
                    valueType: this.context.csharpTypeMapper.convert({ reference: p.valueType }),
                    values: {
                        type: "entries",
                        entries
                    }
                });
            },
            _other: (value) => {
                throw new Error("Unknown example container: " + value.type);
            }
        });
    }

    private getSnippetForPrimitive(examplePrimitive: ExamplePrimitive, parsedDatetimes: boolean): csharp.AstNode {
        const instantiatedPrimitive = examplePrimitive._visit<csharp.InstantiatedPrimitive>({
            integer: (p) => csharp.InstantiatedPrimitive.integer(p),
            long: (p) => csharp.InstantiatedPrimitive.long(p),
            uint: (p) => csharp.InstantiatedPrimitive.uint(p),
            uint64: (p) => csharp.InstantiatedPrimitive.ulong(p),
            float: (p) => csharp.InstantiatedPrimitive.float(p),
            double: (p) => csharp.InstantiatedPrimitive.double(p),
            boolean: (p) => csharp.InstantiatedPrimitive.boolean(p),
            string: (p) => csharp.InstantiatedPrimitive.string(p.original),
            datetime: (datetime) => csharp.InstantiatedPrimitive.dateTime(datetime, parsedDatetimes),
            date: (dateString) => csharp.InstantiatedPrimitive.date(dateString),
            uuid: (p) => csharp.InstantiatedPrimitive.uuid(p),
            base64: (p) => csharp.InstantiatedPrimitive.string(p),
            bigInteger: (p) => csharp.InstantiatedPrimitive.string(p),
            _other: (value) => {
                throw new Error("Unknown example type reference: " + value.type);
            }
        });
        return csharp.codeblock((writer) => writer.writeNode(instantiatedPrimitive));
    }
}
