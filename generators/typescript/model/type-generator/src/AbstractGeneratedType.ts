import { ExampleType, ExampleTypeShape, FernFilepath } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getTextOfTsNode, Reference } from "@fern-typescript/commons";
import { BaseContext, BaseGeneratedType } from "@fern-typescript/contexts";
import { RecursionGuard } from "@fern-typescript/type-reference-example-generator";
import { ModuleDeclarationStructure, StatementStructures, ts, WriterFunction } from "ts-morph";

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
        generateReadWriteOnlyTypes: boolean;
    }
    export namespace getDocs {
        export interface Args<Context> {
            context: Context;
            opts?: {
                isForRequest?: boolean;
                isForResponse?: boolean;
            };
        }
    }
}

const EXAMPLE_PREFIX = "    ";

export abstract class AbstractGeneratedType<Shape, Context extends BaseContext> implements BaseGeneratedType<Context> {
    protected readonly typeName: string;
    protected readonly shape: Shape;
    protected readonly examples: ExampleType[];
    protected readonly fernFilepath: FernFilepath;
    protected readonly getReferenceToSelf: (context: Context) => Reference;
    protected readonly includeSerdeLayer: boolean;
    protected readonly noOptionalProperties: boolean;
    protected readonly retainOriginalCasing: boolean;
    protected readonly enableInlineTypes: boolean;
    protected readonly generateReadWriteOnlyTypes: boolean;

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
        enableInlineTypes,
        generateReadWriteOnlyTypes
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
        this.generateReadWriteOnlyTypes = generateReadWriteOnlyTypes;
    }

    protected getDocs({ context, opts }: AbstractGeneratedType.getDocs.Args<Context>): string | undefined {
        const groups: string[] = [];
        if (this.docs != null) {
            groups.push(this.docs);
        }
        for (const example of this.examples) {
            const exampleStr =
                "@example\n" +
                getTextOfTsNode(
                    this.buildExample(example.shape, context, {
                        isForComment: true,
                        isForTypeDeclarationComment: true,
                        isForRequest: opts?.isForRequest,
                        isForResponse: opts?.isForResponse
                    })
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
    public abstract generateForInlineUnion(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    };
    public abstract generateModule(context: Context): ModuleDeclarationStructure | undefined;
    public abstract buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts, recursionGuard?: RecursionGuard): ts.Expression;
}
