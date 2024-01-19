import { ClassReference } from "./classes/ClassReference";
import { AstNode } from "./core/AstNode";
import { Parameter } from "./Parameter";
import { Property } from "./Property";

interface YardocDocString {
    readonly name: "docString";

    parameters: Parameter[];
    returnValue: ClassReference[] | undefined;
}
interface YardocTypeReference {
    readonly name: "typeReference";
    type: Property | ClassReference | string;
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

    public writeInternal(startingTabSpaces: number): void {
        if (this.reference !== undefined) {
            if (this.reference.name === "typeReference") {
                const typeName =
                    this.reference.type instanceof Property
                        ? this.reference.type.type.typeHint
                        : this.reference.type instanceof ClassReference
                        ? this.reference.type.typeHint
                        : this.reference.type;
                const documentation =
                    this.reference.type instanceof Property ? this.reference.type.type.documentation : undefined;
                this.addText({ stringContent: typeName, templateString: "# @type [%s] ", startingTabSpaces });
                this.addText({ stringContent: documentation, appendToLastString: true });
            } else {
                this.reference.parameters.forEach((parameter) => {
                    this.addText({ stringContent: parameter.name, templateString: "# @param %s", startingTabSpaces });
                    this.addText({
                        stringContent: parameter.type.typeHint,
                        templateString: " [%s] ",
                        appendToLastString: true
                    });
                    this.addText({ stringContent: parameter.documentation, appendToLastString: true });
                });
                if (this.reference.returnValue !== undefined) {
                    this.addText({
                        stringContent: this.reference.returnValue.map((rv) => rv.typeHint).join(", "),
                        templateString: "# @return [%s] ",
                        startingTabSpaces
                    });
                    this.addText({
                        stringContent: this.reference.returnValue.map((rv) => rv.documentation).join(", "),
                        appendToLastString: true
                    });
                }
            }
        }
    }
}
