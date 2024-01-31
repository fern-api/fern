import { ObjectProperty, TypeId } from "@fern-fern/ir-sdk/api";
import { ClassReference, ClassReferenceFactory } from "./classes/ClassReference";
import { AstNode } from "./core/AstNode";
import { Parameter } from "./Parameter";
import { Property } from "./Property";

export interface YardocDocString {
    readonly name: "docString";

    parameters: Parameter[];
    returnValue?: ClassReference[];
}
interface YardocTypeReference {
    readonly name: "typeReference";
    type: Property | ClassReference | string;
}
export declare namespace Yardoc {
    export interface Init extends Omit<AstNode.Init, "documentation"> {
        reference?: YardocDocString | YardocTypeReference;
        flattenedProperties?: Map<TypeId, ObjectProperty[]>;
        crf?: ClassReferenceFactory;
    }
}

export class Yardoc extends AstNode {
    public reference: YardocDocString | YardocTypeReference | undefined;

    // TODO: we should likely make a yardoc generator so we're not passing in this map and the CRF into each instance
    private flattenedProperties: Map<TypeId, ObjectProperty[]> | undefined;
    private crf: ClassReferenceFactory | undefined;

    constructor({ reference, flattenedProperties, crf, ...rest }: Yardoc.Init) {
        super(rest);
        this.reference = reference;
        this.flattenedProperties = flattenedProperties;
        this.crf = crf;
    }

    private writeHashContents(
        name: string,
        typeHint: string | undefined,
        typeId: string | undefined,
        startingTabSpaces: number,
        nestedLayer: number
    ): void {
        const properties: ObjectProperty[] | undefined = this.flattenedProperties?.get(typeId ?? "");

        const postCommentSpacing = " ".repeat(this.tabSizeSpaces * (nestedLayer + 1));
        if (typeId !== undefined && properties !== undefined && this.crf !== undefined) {
            this.addText({
                stringContent: name,
                templateString: `# ${postCommentSpacing}* :%s (Hash)`,
                startingTabSpaces
            });

            properties.forEach((prop) => {
                const classReference = this.crf!.fromTypeReference(prop.valueType);
                this.writeHashContents(
                    prop.name.name.snakeCase.safeName,
                    classReference.typeHint,
                    classReference.resolvedTypeId,
                    startingTabSpaces,
                    nestedLayer + 1
                );
            });
        } else {
            this.addText({ stringContent: name, templateString: `# ${postCommentSpacing}* :%s`, startingTabSpaces });
            this.addText({ stringContent: typeHint, templateString: " (%s) ", appendToLastString: true });
        }
    }

    private writeParameterAsHash(parameter: Parameter, startingTabSpaces: number): void {
        const typeId = parameter.type.resolvedTypeId;
        const properties: ObjectProperty[] | undefined = this.flattenedProperties?.get(typeId ?? "");
        if (typeId === undefined || properties === undefined || this.crf === undefined) {
            this.writeParameterAsClass(parameter, startingTabSpaces);
        } else {
            this.addText({ stringContent: parameter.name, templateString: "# @param %s [Hash] ", startingTabSpaces });
            this.addText({
                stringContent: parameter.documentation ?? `Request of type ${parameter.type.typeHint}, as a Hash`,
                appendToLastString: true
            });
            properties.forEach((prop) => {
                const classReference = this.crf!.fromTypeReference(prop.valueType);
                this.writeHashContents(
                    prop.name.name.snakeCase.safeName,
                    classReference.typeHint,
                    classReference.resolvedTypeId,
                    startingTabSpaces,
                    0
                );
            });
        }
    }

    private writeParameterAsClass(parameter: Parameter, startingTabSpaces: number): void {
        this.addText({ stringContent: parameter.name, templateString: "# @param %s", startingTabSpaces });
        this.addText({
            stringContent: parameter.type.typeHint,
            templateString: " [%s] ",
            appendToLastString: true
        });
        this.addText({ stringContent: parameter.documentation, appendToLastString: true });
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
                    this.reference.type instanceof Property ? this.reference.type.documentation : undefined;
                this.addText({ stringContent: typeName, templateString: "# @type [%s] ", startingTabSpaces });
                this.addText({ stringContent: documentation, appendToLastString: true });
            } else {
                this.reference.parameters.forEach((parameter) => {
                    if (parameter.describeAsHashInYardoc) {
                        this.writeParameterAsHash(parameter, startingTabSpaces);
                    } else {
                        this.writeParameterAsClass(parameter, startingTabSpaces);
                    }
                });
                if (this.reference.returnValue !== undefined) {
                    this.addText({
                        stringContent: this.reference.returnValue.map((rv) => rv.typeHint).join(", "),
                        templateString: "# @return [%s]",
                        startingTabSpaces
                    });
                }
            }
        }
    }
}
