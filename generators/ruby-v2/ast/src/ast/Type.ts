import { assertNever } from "@fern-api/core-utils";

import { ClassReference } from "./ClassReference";
import { TypeParameter } from "./TypeParameter";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

interface Self {
    type: "self";
}

interface Class_ {
    type: "class";
    reference: ClassReference;
}

interface Instance {
    type: "instance";
}

interface Boolean_ {
    type: "boolean";
}

interface Nil {
    type: "nil";
}

interface Top {
    type: "top";
}

interface Bot {
    type: "bot";
}

interface Void {
    type: "void";
}

interface Boolish {
    type: "boolish";
}

interface String_ {
    type: "string";
}

interface Integer {
    type: "integer";
}

interface Union {
    type: "union";
    elems: Type[];
}

interface Intersection {
    type: "intersection";
    elems: Type[];
}

interface Array_ {
    type: "array";
    elem: Type;
}

interface Hash {
    type: "hash";
    keyType: Type;
    valueType: Type;
}

interface Object_ {
    type: "object";
    klass: string;
}

interface Singleton {
    type: "singleton";
    klass: string;
}

interface Tuple {
    type: "tuple";
    elems: Type[];
}

interface Generic {
    type: "generic";
    baseKlass: string;
    parameters: (Type | TypeParameter)[];
}

export type BaseType = Self | Class_ | Instance | Boolean_ | Nil | Top | Bot | Void;
export type SingleType = Boolish | String_ | Integer | Union | Intersection | Singleton | Object_ | Generic;
export type CollectionType = Array_ | Hash | Tuple;

type InternalType = BaseType | SingleType | CollectionType;

/**
 * Reference: https://github.com/ruby/rbs/blob/master/docs/syntax.md
 */
export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType | undefined) {
        super();
    }

    public write(_writer: Writer): void {
        if (!this.internalType) {
            return;
        }

        switch (this.internalType?.type) {
            case "integer":
                _writer.write("Integer");
                return;
            case "string":
                _writer.write("String");
                return;
            case "class":
                _writer.writeNode(this.internalType.reference);
                return;
            case "instance":
                break;
            case "boolean":
                _writer.write("Internal::Types::Boolean");
                return;
            case "nil":
                break;
            case "top":
                break;
            case "bot":
                break;
            case "void":
                break;
            case "boolish":
                break;
            case "union":
                if (this.internalType.elems.length === 2 && this.internalType.elems[1]?.internalType?.type === "nil") {
                    const type = this.internalType.elems[0];
                    if (type != null) {
                        type.write(_writer);
                    }
                }
                break;
            case "intersection":
                break;
            case "array":
                _writer.write("Internal::Types::Array[");
                this.internalType.elem.write(_writer);
                _writer.write("]");
                return;
            case "hash":
                _writer.write("Internal::Types::Hash[");
                this.internalType.keyType.write(_writer);
                _writer.write(", ");
                this.internalType.valueType.write(_writer);
                _writer.write("]");
                return;
            case "object":
                _writer.write("Object");
                break;
            case "singleton":
                break;
            case "generic":
                break;
            case "self":
                break;
            case "tuple":
                break;
            default:
                assertNever(this.internalType);
        }
    }

    public writeTypeDefinition(writer: Writer): void {
        if (this.internalType) {
            switch (this.internalType.type) {
                case "self":
                    writer.write("self");
                    break;
                case "class":
                    writer.write(this.internalType.reference.toString(writer));
                    break;
                case "instance":
                    writer.write("instance");
                    break;
                case "boolean":
                    writer.write("bool");
                    break;
                case "nil":
                    writer.write("nil");
                    break;
                case "top":
                    writer.write("top");
                    break;
                case "bot":
                    writer.write("bot");
                    break;
                case "void":
                    writer.write("void");
                    break;
                case "boolish":
                    writer.write("boolish");
                    break;
                case "string":
                    writer.write("String");
                    break;
                case "integer":
                    writer.write("Integer");
                    break;
                case "union":
                    writer.delimit({
                        nodes: this.internalType.elems,
                        delimiter: " | ",
                        writeFunction: (argument) => argument.writeTypeDefinition(writer)
                    });
                    break;
                case "intersection":
                    writer.delimit({
                        nodes: this.internalType.elems,
                        delimiter: " & ",
                        writeFunction: (argument) => argument.writeTypeDefinition(writer)
                    });
                    break;
                case "array":
                    writer.write("Array[");
                    this.internalType.elem.writeTypeDefinition(writer);
                    writer.write("]");
                    break;
                case "hash":
                    writer.write("Hash[");
                    this.internalType.keyType.writeTypeDefinition(writer);
                    writer.write(", ");
                    this.internalType.valueType.writeTypeDefinition(writer);
                    writer.write("]");
                    break;
                case "object":
                    writer.write(this.internalType.klass);
                    break;
                case "singleton":
                    writer.write("singleton(");
                    writer.write(this.internalType.klass);
                    writer.write(")");
                    break;
                case "tuple":
                    writer.write("[");
                    writer.delimit({
                        nodes: this.internalType.elems,
                        delimiter: ", ",
                        writeFunction: (argument) => argument.write(writer)
                    });
                    writer.write("]");
                    break;
                case "generic":
                    writer.write(`${this.internalType.baseKlass}[`);
                    writer.delimit({
                        nodes: this.internalType.parameters,
                        delimiter: ", ",
                        writeFunction: (argument) => argument.writeTypeDefinition(writer)
                    });
                    writer.write("]");
                    break;
                default:
                    assertNever(this.internalType);
            }
        } else {
            writer.write("untyped");
        }
    }

    public static untyped(): Type {
        return new this(undefined);
    }

    public static self(): Type {
        return new this({
            type: "self"
        });
    }

    public static class_(args: { name: string; modules?: string[] }): Type {
        return new this({
            type: "class",
            reference: new ClassReference({
                name: args.name,
                modules: args.modules,
                fullyQualified: true
            })
        });
    }

    public static instance(): Type {
        return new this({
            type: "instance"
        });
    }

    public static boolean(): Type {
        return new this({
            type: "boolean"
        });
    }
    public static nil(): Type {
        return new this({
            type: "nil"
        });
    }

    public static top(): Type {
        return new this({
            type: "top"
        });
    }

    public static bot(): Type {
        return new this({
            type: "bot"
        });
    }

    public static void(): Type {
        return new this({
            type: "void"
        });
    }

    public static boolish(): Type {
        return new this({
            type: "boolish"
        });
    }

    public static string(): Type {
        return new this({
            type: "string"
        });
    }

    public static integer(): Type {
        return new this({
            type: "integer"
        });
    }

    public static union(elems: Union["elems"]): Type {
        return new this({
            type: "union",
            elems
        });
    }

    public static intersection(elems: Intersection["elems"]): Type {
        return new this({
            type: "intersection",
            elems
        });
    }

    public static array(elem: Type): Type {
        return new this({
            type: "array",
            elem
        });
    }

    public static hash(keyType: Type, valueType: Type): Type {
        return new this({
            type: "hash",
            keyType,
            valueType
        });
    }

    public static object(klass: string): Type {
        return new this({
            type: "object",
            klass
        });
    }

    public static singleton(klass: string): Type {
        return new this({
            type: "singleton",
            klass
        });
    }

    public static tuple(elems: Tuple["elems"]): Type {
        return new this({
            type: "tuple",
            elems
        });
    }

    public static generic(baseKlass: string, parameters: Generic["parameters"]): Type {
        return new this({
            type: "generic",
            baseKlass,
            parameters
        });
    }

    public static nilable(value: Type): Type {
        return Type.union([value, Type.nil()]);
    }

    /**
     * Helper for converting an existing type into an nilable type
     */
    public nilable(): Type {
        return Type.nilable(this);
    }
}
