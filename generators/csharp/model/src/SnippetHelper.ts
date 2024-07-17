import { csharp } from "@fern-api/csharp-codegen";
import {
    ExampleContainer,
    ExampleNamedType,
    ExampleObjectType,
    ExamplePrimitive,
    ExampleTypeReference,
    ExampleUndiscriminatedUnionType,
    ExampleUnionType,
    ObjectTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { execSync } from "child_process";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object/ObjectGenerator";

export class SnippetHelper {
    private context: ModelGeneratorContext;

    constructor(context: ModelGeneratorContext) {
        this.context = context;
    }

    public getSnippetForTypeReference(exampleTypeReference: ExampleTypeReference): csharp.CodeBlock | undefined {
        return exampleTypeReference.shape._visit<csharp.CodeBlock | undefined>({
            primitive: (p) => this.getSnippetForPrimitive(p),
            container: (c) => this.getSnippetForContainer(c),
            unknown: () => csharp.codeblock('"--unknown--"'), // todo: what should this be?
            named: (c) => this.getSnippetForNamed(c),
            _other: () => csharp.codeblock("")
        });
    }

    private getSnippetForNamed(c: ExampleNamedType): csharp.CodeBlock | undefined {
        return c.shape._visit<csharp.CodeBlock | undefined>({
            alias: (exampleAliasType) => this.getSnippetForTypeReference(exampleAliasType.value),
            enum: (exampleEnumType) =>
                csharp.codeblock(
                    `${this.context.csharpTypeMapper.convertToClassReference(c.typeName).name}.${
                        exampleEnumType.value.name.pascalCase.safeName
                    }`
                ),
            object: (exampleObjectType) => this.getSnippedForTypeId(c.typeName.typeId, exampleObjectType),
            union: (exampleUnionType) => this.getSnippetForUnion(exampleUnionType),
            undiscriminatedUnion: (exampleUndiscriminatedUnionType) =>
                this.getSnippetForUndiscriminatedUnion(exampleUndiscriminatedUnionType),
            _other: () => csharp.codeblock("")
        });
    }

    private getSnippedForTypeId(typeId: string, exampleObjectType: ExampleObjectType) {
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(typeId);
        const otd = typeDeclaration.shape._visit<ObjectTypeDeclaration | undefined>({
            alias: () => undefined,
            enum: () => undefined,
            object: (object) => object,
            union: () => undefined,
            undiscriminatedUnion: () => undefined,
            _other: () => undefined
        });
        if (otd == null) {
            throw new Error("Unexpected non-object");
        }
        return new ObjectGenerator(this.context, typeDeclaration, otd).doGenerateSnippet(exampleObjectType);
    }

    private getSnippetForUndiscriminatedUnion(p: ExampleUndiscriminatedUnionType): csharp.CodeBlock | undefined {
        return this.getSnippetForTypeReference(p.singleUnionType);
    }

    private getSnippetForUnion(p: ExampleUnionType): csharp.CodeBlock | undefined {
        return p.singleUnionType.shape._visit<csharp.CodeBlock | undefined>({
            samePropertiesAsObject: (p) => this.getSnippedForTypeId(p.typeId, p.object),
            singleProperty: (p) => this.getSnippetForTypeReference(p),
            noProperties: () => csharp.codeblock('"--no-properties-union--"'),
            _other: () => undefined
        });
    }

    private getSnippetForContainer(c: ExampleContainer): csharp.CodeBlock | undefined {
        const nullCodeBlock = csharp.codeblock("null");
        return c._visit<csharp.CodeBlock | undefined>({
            literal: (p) => csharp.codeblock((writer) => writer.writeNode(this.getSnippetForPrimitive(p.literal))),
            list: (p) => {
                const entries = p.list.map(
                    (exampleTypeReference) => this.getSnippetForTypeReference(exampleTypeReference) ?? nullCodeBlock
                );
                return csharp.codeblock((writer) =>
                    writer.writeNode(
                        csharp.list({
                            itemType: this.context.csharpTypeMapper.convert({
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                reference: p.itemType!,
                                unboxOptionals: true
                            }),
                            entries
                        })
                    )
                );
            },
            set: (p) => {
                const entries = p.set.map(
                    (exampleTypeReference) => this.getSnippetForTypeReference(exampleTypeReference) ?? nullCodeBlock
                );
                return csharp.codeblock((writer) =>
                    writer.writeNode(
                        csharp.set({
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            itemType: this.context.csharpTypeMapper.convert({
                                reference: p.itemType!,
                                unboxOptionals: true
                            }),
                            entries
                        })
                    )
                );
            },
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            optional: (p) => (p.optional == null ? undefined : this.getSnippetForTypeReference(p.optional!)),
            map: (p) => {
                const entries = p.map.map((exampleKeyValuePair) => {
                    const key = this.getSnippetForTypeReference(exampleKeyValuePair.key) ?? nullCodeBlock;
                    const value = this.getSnippetForTypeReference(exampleKeyValuePair.value) ?? nullCodeBlock;
                    return { key, value };
                });
                return csharp.codeblock((writer) =>
                    writer.writeNode(
                        csharp.dictionary({
                            entries,
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            keyType: this.context.csharpTypeMapper.convert({ reference: p.keyType! }),
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            valueType: this.context.csharpTypeMapper.convert({ reference: p.valueType! })
                        })
                    )
                );
            },
            _other: (p) => undefined
        });
    }

    private getSnippetForPrimitive(examplePrimitive: ExamplePrimitive): csharp.CodeBlock {
        const stringValue = examplePrimitive._visit<string>({
            integer: (p) => p.toString(),
            double: (p) => p.toString(),
            string: (p) => `"${this.escapeForCSharp(p.original)}"`,
            boolean: (p) => p.toString(),
            long: (p) => p.toString(),
            datetime: (datetime) => {
                const year = datetime.getFullYear();
                const month = (datetime.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
                const day = datetime.getDate().toString().padStart(2, "0");
                const hours = datetime.getHours().toString().padStart(2, "0");
                const minutes = datetime.getMinutes().toString().padStart(2, "0");
                const seconds = datetime.getSeconds().toString().padStart(2, "0");
                const milliseconds = datetime.getMilliseconds().toString().padStart(3, "0");
                return `new DateTime(${year}, ${month}, ${day}, ${hours}, ${minutes}, ${seconds}, ${milliseconds})`;
            },
            date: (dateString) => {
                const date = new Date(dateString);
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // Months are zero-based
                const day = date.getDate();
                return `new DateOnly(${year}, ${month}, ${day})`;
            },
            uuid: (p) => `new Guid("${p}")`,
            _other: () => ""
        });
        return csharp.codeblock(stringValue);
    }

    private escapeForCSharp(input: string): string {
        return input
            .replace(/\\/g, "\\\\") // Escape backslashes
            .replace(/"/g, '\\"') // Escape double quotes
            .replace(/\n/g, "\\n") // Escape newlines
            .replace(/\r/g, "\\r") // Escape carriage returns
            .replace(/\t/g, "\\t"); // Escape tabs
    }

    public static tryFormatSnippet(snippet: csharp.CodeBlock): string {
        const codeString = snippet.toString() + ";";
        try {
            return SnippetHelper.formatCSharpCode(codeString);
        } catch (e: unknown) {
            return codeString;
        }
    }

    private static formatCSharpCode(code: string): string {
        return execSync("dotnet csharpier --fast", { input: code, encoding: "utf-8" });
    }
}
