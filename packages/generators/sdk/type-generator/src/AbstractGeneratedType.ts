import { FernFilepathV2 } from "@fern-fern/ir-model/commons";
import { ExampleType } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { GetReferenceOpts, Reference } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export declare namespace AbstractGeneratedType {
    export interface Init<Shape, Context> {
        typeName: string;
        shape: Shape;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepathV2;
        getReferenceToSelf: (context: Context) => Reference;
    }
}

const EXAMPLE_PREFIX = "    ";

export abstract class AbstractGeneratedType<Shape, Context> {
    protected typeName: string;
    protected shape: Shape;
    protected examples: ExampleType[];
    protected fernFilepath: FernFilepathV2;
    protected getReferenceToSelf: (context: Context) => Reference;

    private docs: string | undefined;

    constructor({
        getReferenceToSelf,
        typeName,
        shape,
        examples,
        docs,
        fernFilepath,
    }: AbstractGeneratedType.Init<Shape, Context>) {
        this.typeName = typeName;
        this.shape = shape;
        this.examples = examples;
        this.getReferenceToSelf = getReferenceToSelf;
        this.docs = docs;
        this.fernFilepath = fernFilepath;
    }

    protected getDocs(context: Context): string | undefined {
        const groups: string[] = [];
        if (this.docs != null) {
            groups.push(this.docs);
        }
        for (const example of this.examples) {
            const exampleStr =
                "@example\n" + getTextOfTsNode(this.buildExample(example, context, { isForComment: true }));
            groups.push(exampleStr.replaceAll("\n", `\n${EXAMPLE_PREFIX}`));
        }
        if (groups.length === 0) {
            return undefined;
        }
        return groups.join("\n\n");
    }

    protected abstract buildExample(example: ExampleType, context: Context, opts: GetReferenceOpts): ts.Expression;
}
