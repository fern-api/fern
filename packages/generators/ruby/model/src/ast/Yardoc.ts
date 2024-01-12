import { AstNode, NewLinePlacement } from "./AstNode";
import { ClassReference } from "./ClassReference";
import { Parameter } from "./Parameter";
import { Variable } from "./Variable";

interface YardocDocString {
    readonly name: "docString";

    parameters: Parameter[];
    returnClass: ClassReference | undefined;
}
interface YardocTypeReference {
    readonly name: "typeReference";
    variable: ClassReference | Variable;
}
export declare namespace Yardoc {
    export interface Init extends AstNode.Init {
        reference?: YardocDocString | YardocTypeReference;
    }
}

export class Yardoc extends AstNode {
    public reference: YardocDocString | YardocTypeReference | undefined;

    constructor({ reference, ...rest }: Yardoc.Init) {
        super(rest);
        this.reference = reference;
    }

    private writeConditionalDocumentation(documentation?: string) {
        return documentation !== undefined ? ` ${documentation}` : "";
    }
    public writeInternal(startingTabSpaces: number): string {
        let doc = "";
        if (this.documentation !== undefined) {
            doc += this.writePaddedString(
                startingTabSpaces,
                `#${this.writeConditionalDocumentation(this.documentation)}`
            );
        }
        if (!this.reference) {
            return doc;
        } else if (this.reference.name === "typeReference") {
            const typeName =
                this.reference.variable.type instanceof ClassReference
                    ? this.reference.variable.type.name
                    : this.reference.variable.type.valueOf();
            doc += this.writePaddedString(
                startingTabSpaces,
                `# @type [${typeName}]${this.writeConditionalDocumentation(this.reference.variable.documentation)}`,
                NewLinePlacement.BEFORE
            );
        } else {
            doc += this.writePaddedString(startingTabSpaces, "#", NewLinePlacement.BEFORE);
            this.reference.parameters.forEach((classReference, parameterName) => {
                doc += this.writePaddedString(
                    startingTabSpaces,
                    `# @param ${parameterName} [${classReference.name}]${this.writeConditionalDocumentation(
                        classReference.documentation
                    )}`,
                    NewLinePlacement.BEFORE
                );
            });
            if (this.reference.returnClass !== undefined) {
                doc += this.writePaddedString(
                    startingTabSpaces,
                    `# @returns [${this.reference.returnClass.name}]`,
                    NewLinePlacement.BEFORE
                );
            }
        }
        return doc;
    }
}
