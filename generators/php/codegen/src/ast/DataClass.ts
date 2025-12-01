import { php } from "..";
import { Access, ClassReference } from "../php";
import { Class } from "./Class";
import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Field } from "./Field";
import { Method } from "./Method";
import { Parameter } from "./Parameter";
import { Type } from "./Type";
import { convertFromPhpVariableName } from "./utils/convertFromPhpVariableName";
import { orderByAccess } from "./utils/orderByAccess";

const CONSTRUCTOR_PARAMETER_NAME = "values";

export declare namespace DataClass {
    interface Args extends Class.Args {
        constructorAccess?: Access;
    }
}

export class DataClass extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    private readonly constructorAccess: Access;
    private class_: Class;

    constructor({ name, namespace, abstract, docs, parentClassReference, traits, constructorAccess }: DataClass.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.constructorAccess = constructorAccess ?? "public";
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
        return this.class_.fields.every((field) => field.type.isOptional());
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
                ),
                initializer: this.allFieldsAreOptional() ? new CodeBlock("[]") : undefined
            })
        ];
    }
}
