import { php } from "../index.js";
import { Access, ClassReference } from "../php.js";
import { Class } from "./Class.js";
import { CodeBlock } from "./CodeBlock.js";
import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { Field } from "./Field.js";
import { Method } from "./Method.js";
import { Parameter } from "./Parameter.js";
import { Type } from "./Type.js";
import { convertFromPhpVariableName } from "./utils/convertFromPhpVariableName.js";
import { orderByAccess } from "./utils/orderByAccess.js";

const CONSTRUCTOR_PARAMETER_NAME = "values";

export declare namespace DataClass {
    interface Args extends Class.Args {
        constructorAccess?: Access;
        /* Whether to render each documented field as a bullet above the constructor's `$values` @param */
        documentConstructorKeys?: boolean;
    }
}

export class DataClass extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    private readonly constructorAccess: Access;
    private readonly documentConstructorKeys: boolean;
    private class_: Class;

    constructor({
        name,
        namespace,
        abstract,
        docs,
        parentClassReference,
        traits,
        constructorAccess,
        documentConstructorKeys
    }: DataClass.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.constructorAccess = constructorAccess ?? "public";
        this.documentConstructorKeys = documentConstructorKeys ?? false;
        this.class_ = new Class({ name, namespace, abstract, docs, parentClassReference, traits });
    }

    public addField(field: Field): void {
        this.class_.addField(field);
    }

    public addMethod(method: Method): void {
        this.class_.addMethod(method);
    }
    public addTrait(traitClassReference: ClassReference): void {
        this.class_.addTrait(traitClassReference);
    }

    public write(writer: Writer): void {
        const orderedFields = orderByAccess(this.class_.fields).map(
            (field) =>
                ({
                    ...field,
                    name: convertFromPhpVariableName(field.name)
                }) as Field
        );
        this.class_.addConstructor({
            access: this.constructorAccess,
            parameters: this.getConstructorParameters({ orderedFields }),
            body: php.codeblock((writer) => {
                if (orderedFields.length > 0) {
                    for (const field of orderedFields) {
                        writer.write(`$this->${field.name} = $${CONSTRUCTOR_PARAMETER_NAME}['${field.name}']`);
                        if (field.type.isOptional()) {
                            writer.write(" ?? null");
                        } else if (field.initializer != null) {
                            writer.write(" ?? ");
                            field.initializer.write(writer);
                        }
                        writer.write(";");
                    }
                } else {
                    writer.writeLine(`unset($${CONSTRUCTOR_PARAMETER_NAME});`);
                }
            })
        });
        this.class_.write(writer);
    }

    private allFieldsAreOptional(): boolean {
        return this.class_.fields.every((field) => field.type.isOptional() || field.initializer != null);
    }

    private getConstructorParameters({ orderedFields }: { orderedFields: Field[] }): Parameter[] {
        return [
            new Parameter({
                name: CONSTRUCTOR_PARAMETER_NAME,
                type: Type.typeDict(
                    orderedFields.map((field) => ({
                        key: field.name,
                        valueType: field.type,
                        optional: field.type.isOptional() || field.initializer != null
                    })),
                    {
                        multiline: true
                    }
                ),
                initializer: this.allFieldsAreOptional() ? new CodeBlock("[]") : undefined,
                detailDocs: this.documentConstructorKeys ? getFieldKeyDocs(orderedFields) : undefined
            })
        ];
    }
}

/* Collapses docs to a single trimmed line; undefined when empty. */
export function normalizeDocs(docs: string | undefined): string | undefined {
    const trimmed = docs?.trim();
    if (trimmed == null || trimmed === "") {
        return undefined;
    }
    return trimmed.split(/\r?\n/).join(" ");
}

/* One `- \`key\`: docs` bullet per documented field, for use as a tag's detailDocs. */
export function getFieldKeyDocs(fields: { name: string; docs?: string }[]): string[] | undefined {
    const lines = fields.flatMap((field) => {
        const docs = normalizeDocs(field.docs);
        return docs != null ? [`- \`${field.name}\`: ${docs}`] : [];
    });
    return lines.length > 0 ? lines : undefined;
}
