import { ObjectProperty, TypeId } from "@fern-fern/ir-sdk/api";
import { ArrayReference, ClassReference, ClassReferenceFactory } from "./classes/ClassReference";
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
        const classFactory = this.crf;
        const postCommentSpacing = " ".repeat(this.tabSizeSpaces * (nestedLayer + 1));
        if (typeId !== undefined && properties !== undefined && classFactory !== undefined) {
            this.addText({
                stringContent: name,
                templateString: `# ${postCommentSpacing}* :%s (Hash)`,
                startingTabSpaces
            });

            properties.forEach((prop) => {
                const classReference = classFactory.fromTypeReference(prop.valueType);
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

    private writeMultilineYardocComment(documentation?: string[], defaultComment?: string): void {
        documentation?.forEach((doc, index) => {
            const trimmedDoc = doc.trim();
            this.addText({
                stringContent: trimmedDoc.length > 0 ? trimmedDoc : undefined,
                templateString: index > 0 ? "#  " : undefined,
                appendToLastString: index === 0
            });
        }) ?? this.addText({ stringContent: defaultComment, appendToLastString: true });
    }

    private writeParameterAsHash(parameter: Parameter, startingTabSpaces: number): void {
        // TODO: handle multitype better with hashes
        if (parameter.type.length > 1) {
            return this.writeParameterAsClass(parameter, startingTabSpaces);
        }

        let typeId = parameter.type[0]?.resolvedTypeId;
        let isArray = false;
        const classFactory = this.crf;
        // TODO: handle nested hashes better
        if (parameter.type[0] instanceof ArrayReference && parameter.type[0].innerType instanceof ClassReference) {
            isArray = true;
            typeId = parameter.type[0].innerType.resolvedTypeId;
        }
        const properties: ObjectProperty[] | undefined = this.flattenedProperties?.get(typeId ?? "");

        if (typeId === undefined || properties === undefined || classFactory === undefined) {
            this.writeParameterAsClass(parameter, startingTabSpaces);
        } else {
            this.addText({
                stringContent: parameter.name,
                templateString: isArray ? "# @param %s [Array<Hash>] " : "# @param %s [Hash] ",
                startingTabSpaces
            });
            this.writeMultilineYardocComment(
                parameter.documentation,
                `Request of type ${parameter.type.map((param) => param.typeHint).join(", ")}, as a Hash`
            );
            properties.forEach((prop) => {
                const classReference = classFactory.fromTypeReference(prop.valueType);
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
        if (parameter.isBlock) {
            this.addText({ stringContent: parameter.name, templateString: "# @yield", startingTabSpaces });
            this.writeMultilineYardocComment(parameter.documentation);
        } else {
            this.addText({ stringContent: parameter.name, templateString: "# @param %s", startingTabSpaces });
            this.addText({
                stringContent: parameter.type.map((param) => param.typeHint).join(", "),
                templateString: " [%s] ",
                appendToLastString: true
            });
            this.writeMultilineYardocComment(parameter.documentation);
        }
    }

    public writeInternal(startingTabSpaces: number): void {
        if (this.reference !== undefined) {
            if (this.reference.name === "typeReference") {
                const typeName =
                    this.reference.type instanceof Property
                        ? this.reference.type.type.map((prop) => prop.typeHint).join(", ")
                        : this.reference.type instanceof ClassReference
                        ? this.reference.type.typeHint
                        : this.reference.type;
                this.addText({ stringContent: typeName, templateString: "# @type [%s] ", startingTabSpaces });
                this.writeMultilineYardocComment(
                    this.reference.type instanceof Property ? this.reference.type.documentation : []
                );
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
