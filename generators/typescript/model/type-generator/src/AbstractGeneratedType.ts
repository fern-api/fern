import { ExampleType, ExampleTypeShape, FernFilepath, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getTextOfTsNode, Reference } from "@fern-typescript/commons";
import { BaseGeneratedType } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { TypeGenerator } from "./TypeGenerator";

export declare namespace AbstractGeneratedType {
    export interface Init<Shape, Context> extends TypeGenerator.Init {
        typeDeclaration: TypeDeclaration;
        typeName: string;
        shape: Shape;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepath;
        getReferenceToSelf: (context: Context) => Reference;
    }
}

const EXAMPLE_PREFIX = "    ";

export abstract class AbstractGeneratedType<Shape, Context> implements BaseGeneratedType<Context> {
    protected typeName: string;
    protected shape: Shape;
    protected examples: ExampleType[];
    protected fernFilepath: FernFilepath;
    protected getReferenceToSelf: (context: Context) => Reference;
    protected includeSerdeLayer: boolean;
    protected noOptionalProperties: boolean;
    protected retainOriginalCasing: boolean;
    protected includeUtilsOnUnionMembers: boolean;
    protected includeOtherInUnionTypes: boolean;
    protected typeDeclaration: TypeDeclaration;

    private docs: string | undefined;

    constructor({
        typeDeclaration,
        getReferenceToSelf,
        typeName,
        shape,
        examples,
        docs,
        fernFilepath,
        includeSerdeLayer,
        noOptionalProperties,
        retainOriginalCasing,
        includeUtilsOnUnionMembers,
        includeOtherInUnionTypes
    }: AbstractGeneratedType.Init<Shape, Context>) {
        this.typeDeclaration = typeDeclaration;
        this.typeName = typeName;
        this.shape = shape;
        this.examples = examples;
        this.getReferenceToSelf = getReferenceToSelf;
        this.docs = docs;
        this.fernFilepath = fernFilepath;
        this.includeSerdeLayer = includeSerdeLayer;
        this.noOptionalProperties = noOptionalProperties;
        this.retainOriginalCasing = retainOriginalCasing;
        this.includeUtilsOnUnionMembers = includeUtilsOnUnionMembers;
        this.includeOtherInUnionTypes = includeOtherInUnionTypes;
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

    public abstract writeToFile(context: Context): void;
    public abstract buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression;
}
