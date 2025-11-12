import { ast, is, WithGeneration } from "@fern-api/csharp-codegen";
import {
    ExampleContainer,
    ExampleNamedType,
    ExampleObjectType,
    ExamplePrimitive,
    ExampleTypeReference,
    ExampleUndiscriminatedUnionType,
    ExampleUnionType
} from "@fern-fern/ir-sdk/api";
import { fail } from "assert";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ObjectGenerator } from "../object/ObjectGenerator";
import { UnionGenerator } from "../union/UnionGenerator";

export class ExampleGenerator extends WithGeneration {
    constructor(private readonly context: ModelGeneratorContext) {
        super(context.generation);
    }

    public getSnippetForTypeReference({
        exampleTypeReference,
        parseDatetimes
    }: {
        exampleTypeReference: ExampleTypeReference;
        parseDatetimes: boolean;
    }): ast.CodeBlock {
        const astNode = exampleTypeReference.shape._visit<ast.AstNode>({
            primitive: (primitive) => this.getSnippetForPrimitive(primitive, parseDatetimes),
            container: (container) => this.getSnippetForContainer(container, parseDatetimes),
            unknown: (value) => this.getSnippetForUnknown(value),
            named: (named) => this.getSnippetForNamed(named, parseDatetimes),
            _other: () => {
                throw new Error(`Unknown example type reference: ${exampleTypeReference.shape.type}`);
            }
        });
        return this.csharp.codeblock((writer) => writer.write(astNode));
    }

    private getSnippetForUnknown(unknownExample: unknown): ast.AstNode {
        switch (typeof unknownExample) {
            case "boolean":
                return this.csharp.InstantiatedPrimitive.boolean(unknownExample);
            case "string":
                return this.csharp.InstantiatedPrimitive.string(unknownExample);
            case "number":
                return this.csharp.InstantiatedPrimitive.double(unknownExample);
            case "object":
                if (Array.isArray(unknownExample)) {
                    const values = unknownExample.map((value) => this.getSnippetForUnknown(value));
                    return this.csharp.list({
                        entries: values,
                        itemType: this.Primitive.object.toOptionalIfNotAlready()
                    });
                } else if (unknownExample != null && unknownExample instanceof Object) {
                    const keys = Object.keys(unknownExample).sort();
                    const entries = keys.map((key) => ({
                        key: this.csharp.InstantiatedPrimitive.string(key),
                        value: this.getSnippetForUnknown((unknownExample as Record<string, unknown>)[key])
                    }));
                    return this.csharp.dictionary({
                        keyType: this.Primitive.object,
                        valueType: this.Primitive.object.toOptionalIfNotAlready(),
                        values: {
                            type: "entries",
                            entries
                        }
                    });
                }
                break;
        }
        return this.csharp.InstantiatedPrimitive.null();
    }

    private getSnippetForNamed(exampleNamedType: ExampleNamedType, parseDatetimes: boolean): ast.AstNode {
        return exampleNamedType.shape._visit<ast.AstNode>({
            alias: (exampleAliasType) =>
                this.getSnippetForTypeReference({ exampleTypeReference: exampleAliasType.value, parseDatetimes }),
            enum: (exampleEnumType) => {
                const enumDecl = this.model.dereferenceType(exampleNamedType).typeDeclaration.shape;

                if (!is.IR.Type.Enum(enumDecl)) {
                    fail(`Expected enum type declaration, got: ${enumDecl.type}`);
                }

                return this.csharp.enumInstantiation({
                    reference: this.context.csharpTypeMapper.convertToClassReference(exampleNamedType.typeName),
                    value: this.model.getEnumValueName(enumDecl, exampleEnumType)
                });
            },
            object: (exampleObjectType) =>
                this.getSnippetForTypeId(exampleNamedType.typeName.typeId, exampleObjectType, parseDatetimes),
            union: (exampleUnionType) =>
                this.getSnippetForUnion(exampleNamedType.typeName.typeId, exampleUnionType, parseDatetimes),
            undiscriminatedUnion: (exampleUndiscriminatedUnionType) =>
                this.getSnippetForUndiscriminatedUnion(exampleUndiscriminatedUnionType, parseDatetimes),
            _other: () => {
                throw new Error(`Unknown example type: ${exampleNamedType.shape.type}`);
            }
        });
    }

    private getSnippetForTypeId(
        typeId: string,
        exampleObjectType: ExampleObjectType,
        parseDatetimes: boolean
    ): ast.AstNode {
        const typeDeclaration = this.model.dereferenceType(typeId).typeDeclaration;
        if (typeDeclaration.shape.type !== "object") {
            throw new Error("Unexpected non object in Example Generator");
        }
        return new ObjectGenerator(this.context, typeDeclaration, typeDeclaration.shape).doGenerateSnippet({
            exampleObject: exampleObjectType,
            parseDatetimes
        });
    }

    private getSnippetForUndiscriminatedUnion(
        exampleUndiscriminatedUnionType: ExampleUndiscriminatedUnionType,
        parseDatetimes: boolean
    ): ast.AstNode {
        return this.getSnippetForTypeReference({
            exampleTypeReference: exampleUndiscriminatedUnionType.singleUnionType,
            parseDatetimes
        });
    }

    private getSnippetForUnion(
        typeId: string,
        exampleUnionType: ExampleUnionType,
        parseDatetimes: boolean
    ): ast.AstNode {
        if (this.settings.shouldGeneratedDiscriminatedUnions) {
            const typeDeclaration = this.model.dereferenceType(typeId).typeDeclaration;
            if (typeDeclaration.shape.type !== "union") {
                throw new Error("Unexpected non union in Example Generator");
            }
            return new UnionGenerator(this.context, typeDeclaration, typeDeclaration.shape).doGenerateSnippet({
                exampleUnion: exampleUnionType,
                parseDatetimes
            });
        }
        return exampleUnionType.singleUnionType.shape._visit<ast.AstNode>({
            samePropertiesAsObject: (p) => this.getSnippetForTypeId(p.typeId, p.object, parseDatetimes),
            singleProperty: (p) => this.getSnippetForTypeReference({ exampleTypeReference: p, parseDatetimes }),
            // todo: figure out what to put here
            noProperties: () => this.csharp.codeblock('"no-properties-union"'),
            _other: (value) => {
                throw new Error(`Unknown example type reference: ${value.type}`);
            }
        });
    }

    private getSnippetForContainer(c: ExampleContainer, parseDatetimes: boolean): ast.AstNode {
        return c._visit<ast.AstNode>({
            literal: (p) =>
                this.csharp.codeblock((writer) =>
                    writer.write(this.getSnippetForPrimitive(p.literal, parseDatetimes), "\n")
                ),
            list: (p) => {
                const entries = p.list.map((exampleTypeReference) =>
                    this.getSnippetForTypeReference({ exampleTypeReference, parseDatetimes })
                );
                if (this.context.isReadOnlyMemoryType(p.itemType)) {
                    return this.csharp.readOnlyMemory({
                        itemType: this.context.csharpTypeMapper.convert({
                            reference: p.itemType,
                            unboxOptionals: true
                        }),
                        entries
                    });
                } else {
                    return this.csharp.list({
                        itemType: this.context.csharpTypeMapper.convert({
                            reference: p.itemType,
                            unboxOptionals: true
                        }),
                        entries
                    });
                }
            },
            set: (p) => {
                const entries = p.set.map((exampleTypeReference) =>
                    this.getSnippetForTypeReference({ exampleTypeReference, parseDatetimes })
                );
                return this.csharp.set({
                    itemType: this.context.csharpTypeMapper.convert({
                        reference: p.itemType,
                        unboxOptionals: true
                    }),
                    entries
                });
            },
            optional: (p) =>
                p.optional == null
                    ? this.csharp.InstantiatedPrimitive.null()
                    : this.getSnippetForTypeReference({
                          exampleTypeReference: p.optional,
                          parseDatetimes
                      }),
            nullable: (p) =>
                p.nullable == null
                    ? this.csharp.InstantiatedPrimitive.null()
                    : this.getSnippetForTypeReference({
                          exampleTypeReference: p.nullable,
                          parseDatetimes
                      }),
            map: (p) => {
                const entries = p.map.map((exampleKeyValuePair) => {
                    return {
                        key: this.getSnippetForTypeReference({
                            exampleTypeReference: exampleKeyValuePair.key,
                            parseDatetimes
                        }),
                        value: this.getSnippetForTypeReference({
                            exampleTypeReference: exampleKeyValuePair.value,
                            parseDatetimes
                        })
                    };
                });
                return this.csharp.dictionary({
                    keyType: this.context.csharpTypeMapper.convert({ reference: p.keyType }),
                    valueType:
                        p.valueType.type === "unknown"
                            ? this.context.csharpTypeMapper.convert({ reference: p.valueType }).toOptionalIfNotAlready()
                            : this.context.csharpTypeMapper.convert({ reference: p.valueType }),
                    values: {
                        type: "entries",
                        entries
                    }
                });
            },
            _other: (value) => {
                throw new Error(`Unknown example container: ${value.type}`);
            }
        });
    }

    private getSnippetForPrimitive(examplePrimitive: ExamplePrimitive, parseDatetimes: boolean): ast.AstNode {
        const instantiatedPrimitive = examplePrimitive._visit<ast.InstantiatedPrimitive>({
            integer: (p) => this.csharp.InstantiatedPrimitive.integer(p),
            long: (p) => this.csharp.InstantiatedPrimitive.long(p),
            uint: (p) => this.csharp.InstantiatedPrimitive.uint(p),
            uint64: (p) => this.csharp.InstantiatedPrimitive.ulong(p),
            float: (p) => this.csharp.InstantiatedPrimitive.float(p),
            double: (p) => this.csharp.InstantiatedPrimitive.double(p),
            boolean: (p) => this.csharp.InstantiatedPrimitive.boolean(p),
            string: (p) => this.csharp.InstantiatedPrimitive.string(p.original),
            datetime: (example) => this.csharp.InstantiatedPrimitive.dateTime(example.datetime, parseDatetimes),
            date: (dateString) => this.csharp.InstantiatedPrimitive.date(dateString),
            uuid: (p) => this.csharp.InstantiatedPrimitive.uuid(p),
            base64: (p) => this.csharp.InstantiatedPrimitive.string(p),
            bigInteger: (p) => this.csharp.InstantiatedPrimitive.string(p),
            _other: (value) => {
                throw new Error(`Unknown example type reference: ${value.type}`);
            }
        });
        return this.csharp.codeblock((writer) => writer.write(instantiatedPrimitive));
    }
}
