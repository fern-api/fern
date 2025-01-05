import { ObjectProperty, TypeId } from "@fern-fern/ir-sdk/api";

import { ExampleGenerator } from "./ExampleGenerator";
import { Parameter } from "./Parameter";
import { Property } from "./Property";
import {
    ArrayReference,
    ClassReference,
    ClassReferenceFactory,
    DiscriminatedUnionClassReference
} from "./classes/ClassReference";
import { AstNode } from "./core/AstNode";
import { Function_ } from "./functions/Function_";

export interface YardocDocString {
    readonly name: "docString";

    baseFunction?: Function_;
    documentation?: string[];
    parameters: Parameter[];
    returnValue?: ClassReference[];
}
interface YardocTypeReference {
    readonly name: "typeReference";
    type: Property | ClassReference | string;
}

interface YardocDocUniversal {
    readonly name: "universal";
    documentation: string[];
}
export declare namespace Yardoc {
    export interface Init extends Omit<AstNode.Init, "documentation"> {
        reference?: YardocDocString | YardocTypeReference | YardocDocUniversal;
        flattenedProperties?: Map<TypeId, ObjectProperty[]>;
        crf?: ClassReferenceFactory;
        eg?: ExampleGenerator;
    }
}

export class Yardoc extends AstNode {
    public reference: YardocDocString | YardocTypeReference | YardocDocUniversal | undefined;

    // TODO: we should likely make a yardoc generator so we're not passing in this map and the CRF into each instance
    private flattenedProperties: Map<TypeId, ObjectProperty[]> | undefined;
    private crf: ClassReferenceFactory | undefined;
    private eg: ExampleGenerator | undefined;

    constructor({ reference, flattenedProperties, crf, eg, ...rest }: Yardoc.Init) {
        super(rest);
        this.reference = reference;
        this.flattenedProperties = flattenedProperties;
        this.crf = crf;
        this.eg = eg;
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
                    this.getTypeHint(classReference),
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

    private writeMultilineYardocComment(
        documentation?: string[],
        defaultComment?: string,
        templateString?: string,
        shouldSplitOnLength = true
    ): void {
        // Attempt to apply a max line length for comments at 80 characters since Rubocop does not format comments.
        const splitDocs = shouldSplitOnLength
            ? documentation?.flatMap((doc) => doc.match(/.{1,80}(?:\s|$)/g) ?? "")
            : documentation;
        splitDocs?.forEach((doc, index) => {
            const trimmedDoc = shouldSplitOnLength ? doc.trim() : doc;
            this.addText({
                stringContent: trimmedDoc.length > 0 ? trimmedDoc : undefined,
                templateString: index > 0 ? "#  %s" : templateString,
                appendToLastString: index === 0 && templateString == null
            });
        }) ?? this.addText({ stringContent: defaultComment, appendToLastString: true });
    }

    private writeParameterAsHash(parameter: Parameter, startingTabSpaces: number): void {
        if (
            parameter.type.length > 1 ||
            parameter.type[0] instanceof DiscriminatedUnionClassReference ||
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (parameter.type.length === 1 && this.isUnion(parameter.type[0]!))
        ) {
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
                `Request of type ${parameter.type.map((param) => this.getTypeHint(param)).join(", ")}, as a Hash`
            );
            properties.forEach((prop) => {
                const classReference = classFactory.fromTypeReference(prop.valueType);
                this.writeHashContents(
                    prop.name.name.snakeCase.safeName,
                    this.getTypeHint(classReference),
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
                stringContent: parameter.type.map((param) => this.getTypeHint(param)).join(", "),
                templateString: " [%s] ",
                appendToLastString: true
            });
            this.writeMultilineYardocComment(parameter.documentation);
        }
    }

    private getTypeHint(cr: ClassReference): string {
        return this.crf !== undefined
            ? (this.crf.resolvedReferences
                  .get(cr.resolvedTypeId ?? "")
                  ?.map((innerCr) => innerCr.typeHint)
                  ?.join(", ") ?? cr.typeHint)
            : cr.typeHint;
    }

    private isUnion(cr: ClassReference): boolean {
        return this.crf !== undefined
            ? (this.crf.resolvedReferences.get(cr.resolvedTypeId ?? "") ?? []).length > 1
            : false;
    }

    public writeInternal(startingTabSpaces: number): void {
        if (this.reference !== undefined) {
            if (this.reference.name === "universal") {
                this.writeMultilineYardocComment(this.reference.documentation, undefined, "# %s");
            } else if (this.reference.name === "typeReference") {
                const typeName =
                    this.reference.type instanceof Property
                        ? this.reference.type.type.flatMap((prop) => this.getTypeHint(prop)).join(", ")
                        : this.reference.type instanceof ClassReference
                          ? this.getTypeHint(this.reference.type)
                          : this.reference.type;
                this.addText({ stringContent: typeName, templateString: "# @return [%s] ", startingTabSpaces });
                this.writeMultilineYardocComment(
                    this.reference.type instanceof Property ? this.reference.type.documentation : []
                );
            } else {
                this.writeMultilineYardocComment(this.reference.documentation, undefined, "# %s");
                if (this.reference.documentation !== undefined && this.reference.documentation.length > 0) {
                    this.addText({
                        stringContent: "#",
                        startingTabSpaces
                    });
                }
                this.reference.parameters.forEach((parameter) => {
                    if (parameter.describeAsHashInYardoc) {
                        this.writeParameterAsHash(parameter, startingTabSpaces);
                    } else {
                        this.writeParameterAsClass(parameter, startingTabSpaces);
                    }
                });
                if (this.reference.returnValue !== undefined) {
                    this.addText({
                        stringContent: this.reference.returnValue.map((rv) => this.getTypeHint(rv)).join(", "),
                        templateString: "# @return [%s]",
                        startingTabSpaces
                    });
                }

                if (this.eg != null && this.reference.baseFunction != null) {
                    const snippet = this.eg.generateEndpointSnippet(this.reference.baseFunction);
                    if (snippet == null) {
                        return;
                    }

                    // TODO: add the example's docs, they'd go on this line, ex: `# @example This is an example with a file object`
                    this.addText({ stringContent: "# @example", startingTabSpaces });
                    const rootClientSnippet = this.eg.generateClientSnippet();
                    this.writeMultilineYardocComment(
                        rootClientSnippet.write({}).split("\n"),
                        undefined,
                        "#  %s",
                        false
                    );

                    const snippetString = snippet instanceof AstNode ? snippet.write({}) : snippet;
                    this.writeMultilineYardocComment(snippetString.split("\n"), undefined, "#  %s", false);
                }
            }
        }
    }
}
