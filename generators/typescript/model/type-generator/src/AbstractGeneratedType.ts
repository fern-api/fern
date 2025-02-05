import { GetReferenceOpts, Reference, getTextOfTsNode } from "@fern-typescript/commons";
import { BaseContext, BaseGeneratedType } from "@fern-typescript/contexts";
import { ModuleDeclarationStructure, StatementStructures, WriterFunction, ts } from "ts-morph";

import { ExampleType, ExampleTypeShape, FernFilepath } from "@fern-fern/ir-sdk/api";

export declare namespace AbstractGeneratedType {
    export interface Init<Shape, Context> {
        typeName: string;
        shape: Shape;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepath;
        getReferenceToSelf: (context: Context) => Reference;
        includeSerdeLayer: boolean;
        noOptionalProperties: boolean;
        retainOriginalCasing: boolean;
        /** Whether inline types should be inlined */
        enableInlineTypes: boolean;
    }
}

const EXAMPLE_PREFIX = "    ";

export abstract class AbstractGeneratedType<Shape, Context extends BaseContext> implements BaseGeneratedType<Context> {
    protected typeName: string;
    protected shape: Shape;
    protected examples: ExampleType[];
    protected fernFilepath: FernFilepath;
    protected getReferenceToSelf: (context: Context) => Reference;
    protected includeSerdeLayer: boolean;
    protected noOptionalProperties: boolean;
    protected retainOriginalCasing: boolean;
    protected enableInlineTypes: boolean;

    private docs: string | undefined;

    constructor({
        getReferenceToSelf,
        typeName,
        shape,
        examples,
        docs,
        fernFilepath,
        includeSerdeLayer,
        noOptionalProperties,
        retainOriginalCasing,
        enableInlineTypes
    }: AbstractGeneratedType.Init<Shape, Context>) {
        this.typeName = typeName;
        this.shape = shape;
        this.examples = examples;
        this.getReferenceToSelf = getReferenceToSelf;
        this.docs = docs;
        this.fernFilepath = fernFilepath;
        this.includeSerdeLayer = includeSerdeLayer;
        this.noOptionalProperties = noOptionalProperties;
        this.retainOriginalCasing = retainOriginalCasing;
        this.enableInlineTypes = enableInlineTypes;
    }

    protected getDocs(context: Context): string | undefined {
        const groups: string[] = [];
        if (this.docs != null) {
            groups.push(this.docs);
        }
        for (const example of this.examples) {
            const exampleStr =
                "@example\n" +
                getTextOfTsNode(
                    this.buildExample(example.shape, context, { isForComment: true, isForTypeDeclarationComment: true })
                );
            groups.push(exampleStr.replaceAll("\n", `\n${EXAMPLE_PREFIX}`));
        }
        if (groups.length === 0) {
            return undefined;
        }
        return groups.join("\n\n");
    }

    public writeToFile(context: Context): void {
        context.sourceFile.addStatements(this.generateStatements(context));
    }

    public abstract generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[];
    public abstract generateForInlineUnion(context: Context): ts.TypeNode;
    public abstract generateModule(context: Context): ModuleDeclarationStructure | undefined;
    public abstract buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression;
}
