import { AbstractAstNode } from "@fern-api/generator-commons";
import { BasePhpCustomConfigSchema } from "../../custom-config/BasePhpCustomConfigSchema";
import { Namespace } from "../../project/PhpFile";
import { ClassReference } from "../ClassReference";
import { AstNode } from "./AstNode";
import { GLOBAL_NAMESPACE } from "./Constant";
import { Writer } from "./Writer";

export declare namespace ReferenceCollector {
    interface Args {
        /* The namespace that is being written to */
        namespace: string;
        /* The root namespace of the project */
        rootNamespace: string;
        /* Custom generator config */
        customConfig: BasePhpCustomConfigSchema;
    }
}

export class ReferenceCollector extends Writer {
    constructor({ namespace, rootNamespace, customConfig }: ReferenceCollector.Args) {
        super({ namespace, rootNamespace, customConfig, references: {} });
    }

    override write(_text: string): void {}

    override writeNode(node: AbstractAstNode): void {
        node.write(this);
    }

    override writeNodeStatement(node: AbstractAstNode): void {
        this.writeNode(node);
    }

    override writeTextStatement(_text: string): void {}

    override controlFlow(_prefix: string, statement: AbstractAstNode): void {
        this.writeNode(statement);
    }

    override endControlFlow(): void {}

    override openBlock(
        _titles: (string | undefined)[],
        _openingCharacter: string | undefined = "{",
        _callback: () => void,
        _closingCharacter: string | undefined = "}"
    ): void {}

    override writeLine(_text = ""): void {}

    override newLine(): void {}

    override writeNewLineIfLastLineNot(): void {}

    override indent(): void {}

    override dedent(): void {}

    public collectAllReferences(astNode: AstNode): Record<Namespace, ClassReference> {
        astNode.write(this);
        return this.references;
    }

    override addReference(reference: ClassReference): void {
        this.references[this.toImportString(reference)] = reference;
    }
}
