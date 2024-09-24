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
    public fields: Field[] = [];

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
                        const fieldAccessor = `$${CONSTRUCTOR_PARAMETER_NAME}['${field.name}']`;
                        writer.write(`$this->${field.name} = ${fieldAccessor}`);
                        if (field.constructorEnumType != null) {
                            // writer.write(php.);
                            if (field.type.isOptional()) {
                                writer.write("?");
                            }
                            writer.write("->value");
                        }
                        if (field.type.isOptional()) {
                            writer.write(" ?? null");
                        }
                        writer.writeLine(";");
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
                        valueType:
                            field.constructorEnumType == null
                                ? field.type
                                : field.constructorEnumType.internalType.type === "optional"
                                ? Type.optional(
                                      Type.union([field.constructorEnumType.internalType.value, Type.string()])
                                  )
                                : Type.union([field.constructorEnumType, Type.string()]),
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
