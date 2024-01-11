import { AstNode, NewLinePlacement } from "../AstNode";
import { Class_ } from "./Class_";
import { Parameter } from "./Parameter";

interface YardocDocString {
    readonly name: "docString";

    parameters: Parameter[];
    returnClass: Class_ | undefined;
}
interface YardocTypeReference {
    readonly name: "typeReference";
    type: Class_;
}
export class Yardoc extends AstNode {
    public reference: YardocDocString | YardocTypeReference | undefined;

    constructor(documentation?: string, reference?: YardocDocString | YardocTypeReference) {
        super(documentation);
        this.reference = reference;
    }

    private writeConditionalDocumentation(documentation?: string) {
        return (documentation !== undefined) ? ` ${documentation}` : "";
    }
    public writeInternal(startingTabSpaces: number): string {
        let doc = "";
        if (this.documentation !== undefined) {
            doc += this.writePaddedString(startingTabSpaces, `#${this.writeConditionalDocumentation(this.documentation)}`);
        }
        if (!this.reference) {
            return doc;
        } else if (this.reference.name === "typeReference") {
            doc += this.writePaddedString(startingTabSpaces, `# @type [${this.reference.type.name}]${this.writeConditionalDocumentation(this.reference.type.documentation)}`, NewLinePlacement.BEFORE);
        } else {
            doc += this.writePaddedString(startingTabSpaces, "#", NewLinePlacement.BEFORE);
            this.reference.parameters.forEach((classReference, parameterName) => {
                doc += this.writePaddedString(startingTabSpaces, `# @param ${parameterName} [${classReference.name}]${this.writeConditionalDocumentation(classReference.documentation)}`, NewLinePlacement.BEFORE);
            });
            if (this.reference.returnClass !== undefined) {
                doc += this.writePaddedString(startingTabSpaces, `# @returns [${this.reference.returnClass.name}]`, NewLinePlacement.BEFORE);    
            }
        }
        return doc;
    }
}