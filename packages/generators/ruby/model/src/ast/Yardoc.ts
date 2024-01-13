import { AstNode, NewLinePlacement } from "./AstNode";
import { ClassReference } from "./classes/ClassReference";
import { Parameter } from "./Parameter";
import { Property } from "./Property";

interface YardocDocString {
    readonly name: "docString";

    parameters: Parameter[];
    returnValue: ClassReference | undefined;
}
interface YardocTypeReference {
    readonly name: "typeReference";
    type: Property | string;
}
export declare namespace Yardoc {
    export interface Init extends Omit<AstNode.Init, "documentation"> {
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
        if (!this.reference) {
            return doc;
        } else if (this.reference.name === "typeReference") {
            const typeName =
                this.reference.type instanceof Property ? this.reference.type.type.name : this.reference.type;
            const documentation =
                this.reference.type instanceof Property ? this.reference.type.type.documentation : undefined;
            doc += this.writePaddedString(
                startingTabSpaces,
                `# @type [${typeName}]${this.writeConditionalDocumentation(documentation)}`,
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
            if (this.reference.returnValue !== undefined) {
                doc += this.writePaddedString(
                    startingTabSpaces,
                    `# @returns [${this.reference.returnValue.name}]`,
                    NewLinePlacement.BEFORE
                );
            }
        }
        return doc;
    }
}
