import { AstNode } from "./core/AstNode";
import { Class } from "./Class";
import { Writer } from "./core/Writer";
import { Parameter } from "./Parameter";
import { Field } from "./Field";
import { Method } from "./Method";
import { Type } from "./Type";
import { orderByAccess } from "./utils/orderByAccess";
import { php } from "..";
import { convertFromPhpVariableName } from "./utils/convertFromPhpVariableName";

const CONSTRUCTOR_PARAMETER_NAME = "values";

export declare namespace DataClass {
    type Args = Class.Args;
}

export class DataClass extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    private class_: Class;

    constructor({ name, namespace, abstract, docs, parentClassReference }: DataClass.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.class_ = new Class({ name, namespace, abstract, docs, parentClassReference });
    }

    public addField(field: Field): void {
        this.class_.addField(field);
    }

    public addMethod(method: Method): void {
        this.class_.addMethod(method);
    }

    public write(writer: Writer): void {
        const orderedFields = orderByAccess(this.class_.fields).map(
            (field) =>
                ({
                    ...field,
                    name: convertFromPhpVariableName(field.name)
                } as Field)
        );
        if (orderedFields.length > 0) {
            this.class_.addConstructor({
                access: "public",
                parameters: this.getConstructorParameters({ orderedFields }),
                body: php.codeblock((writer) => {
                    for (const field of orderedFields) {
                        writer.write(`$this->${field.name} = $${CONSTRUCTOR_PARAMETER_NAME}['${field.name}']`);
                        if (field.type.isOptional()) {
                            writer.write(" ?? null");
                        }
                        writer.write(";");
                    }
                })
            });
        }
        this.class_.write(writer);
    }

    private getConstructorParameters({ orderedFields }: { orderedFields: Field[] }): Parameter[] {
        return [
            new Parameter({
                name: CONSTRUCTOR_PARAMETER_NAME,
                type: Type.typeDict(
                    orderedFields.map((field) => ({
                        key: field.name,
                        valueType: field.type,
                        optional: field.type.isOptional()
                    })),
                    {
                        multiline: true
                    }
                )
            })
        ];
    }
}
