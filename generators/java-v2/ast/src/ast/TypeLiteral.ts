import { assertNever } from "@fern-api/core-utils";

import { java } from "..";
import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { ArraysClassReference, OptionalClassReference, Type } from "./Type";

type InternalTypeLiteral =
    | BigInteger
    | Boolean_
    | Builder
    | Bytes
    | Class_
    | Date
    | DateTime
    | Double
    | Enum
    | Float
    | Integer
    | List
    | Long
    | Map
    | Optional
    | Raw
    | Reference
    | Set
    | String_
    | Unknown
    | UUID
    | Nop;

interface BigInteger {
    type: "bigInteger";
    value: string;
}

interface Boolean_ {
    type: "boolean";
    value: boolean;
}

interface Builder {
    type: "builder";
    classReference: ClassReference;
    parameters: BuilderParameter[];
}

export interface BuilderParameter {
    name: string;
    value: TypeLiteral;
}

interface Bytes {
    type: "bytes";
    value: string;
}

interface Class_ {
    type: "class";
    reference: ClassReference;
    parameters: ConstructorParameter[];
}

export interface ConstructorParameter {
    name: string;
    value: TypeLiteral;
}

interface Float {
    type: "float";
    value: number;
}

interface Date {
    type: "date";
    value: string;
}

interface DateTime {
    type: "dateTime";
    value: string;
}

interface Double {
    type: "double";
    value: number;
}

interface Enum {
    type: "enum";
    classReference: ClassReference;
    value: string;
}

interface Integer {
    type: "integer";
    value: number;
}

interface List {
    type: "list";
    valueType: Type;
    values: TypeLiteral[];
    isParameter?: boolean; // If true, generates Arrays.asList() directly for method parameters instead of wrapping with new ArrayList()
}

interface Long {
    type: "long";
    value: number;
}

interface Map {
    type: "map";
    keyType: Type;
    valueType: Type;
    entries: MapEntry[];
}

interface MapEntry {
    key: TypeLiteral;
    value: TypeLiteral;
}

interface Optional {
    type: "optional";
    value: TypeLiteral;
    useOf?: boolean;
}

interface Raw {
    type: "raw";
    value: string | AstNode;
}

interface Reference {
    type: "reference";
    value: AstNode;
}

interface Set {
    type: "set";
    valueType: Type;
    values: TypeLiteral[];
}

interface String_ {
    type: "string";
    value: string;
}

interface Unknown {
    type: "unknown";
    value: unknown;
}

interface UUID {
    type: "uuid";
    value: string;
}

interface Nop {
    type: "nop";
}

export class TypeLiteral extends AstNode {
    private constructor(public readonly internalType: InternalTypeLiteral) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "bigInteger":
                this.writeBigInteger({ writer, bigInteger: this.internalType });
                break;
            case "boolean":
                writer.write(this.internalType.value.toString());
                break;
            case "builder":
                this.writeBuilder({ writer, builder: this.internalType });
                break;
            case "bytes":
                writer.write(`"${this.internalType.value}".getBytes()`);
                break;
            case "class": {
                this.writeClass({ writer, class_: this.internalType });
                break;
            }
            case "date":
                this.writeDate({ writer, date: this.internalType });
                break;
            case "dateTime":
                this.writeDateTime({ writer, dateTime: this.internalType });
                break;
            case "double": {
                const valueStr = this.internalType.value.toString();
                if (!valueStr.includes(".") && !valueStr.includes("e") && !valueStr.includes("E")) {
                    writer.write(`${valueStr}.0`);
                } else {
                    writer.write(valueStr);
                }
                break;
            }
            case "enum":
                this.writeEnum({ writer, enum_: this.internalType });
                break;
            case "float":
                writer.write(`${this.internalType.value}f`);
                break;
            case "integer":
                writer.write(Math.floor(this.internalType.value).toString());
                break;
            case "list": {
                this.writeList({ writer, list: this.internalType });
                break;
            }
            case "long": {
                writer.write(`${Math.floor(this.internalType.value)}L`);
                break;
            }
            case "map": {
                this.writeMap({ writer, map: this.internalType });
                break;
            }
            case "optional": {
                this.writeOptional({ writer, optional: this.internalType });
                break;
            }
            case "raw": {
                if (this.internalType.value instanceof AstNode) {
                    writer.writeNode(this.internalType.value);
                } else {
                    writer.write(this.internalType.value);
                }
                break;
            }
            case "reference":
                writer.writeNode(this.internalType.value);
                break;
            case "set": {
                this.writeSet({ writer, set: this.internalType });
                break;
            }
            case "string":
                writer.write(`"${this.escapeString(this.internalType.value)}"`);
                break;
            case "unknown":
                this.writeUnknown({ writer, value: this.internalType.value });
                break;
            case "uuid":
                this.writeUUID({ writer, uuid: this.internalType });
                break;
            case "nop":
                break;
            default:
                assertNever(this.internalType);
        }
    }

    public isOptional(): boolean {
        return this.internalType.type === "optional";
    }

    /* Static factory methods for creating a Type */
    public static bigInteger(value: string): TypeLiteral {
        return new this({
            type: "bigInteger",
            value
        });
    }

    public static boolean(value: boolean): TypeLiteral {
        return new this({
            type: "boolean",
            value
        });
    }

    public static builder({
        classReference,
        parameters
    }: {
        classReference: ClassReference;
        parameters: BuilderParameter[];
    }): TypeLiteral {
        return new this({ type: "builder", classReference, parameters });
    }

    public static bytes(value: string): TypeLiteral {
        return new this({
            type: "bytes",
            value
        });
    }

    public static class_({
        reference,
        parameters
    }: {
        reference: ClassReference;
        parameters: ConstructorParameter[];
    }): TypeLiteral {
        return new this({ type: "class", reference, parameters });
    }

    public static date(value: string): TypeLiteral {
        return new this({
            type: "date",
            value
        });
    }

    public static dateTime(value: string): TypeLiteral {
        return new this({
            type: "dateTime",
            value
        });
    }

    public static double(value: number): TypeLiteral {
        return new this({
            type: "double",
            value
        });
    }

    public static enum_({ classReference, value }: { classReference: ClassReference; value: string }): TypeLiteral {
        return new this({
            type: "enum",
            classReference,
            value
        });
    }

    public static float(value: number): TypeLiteral {
        return new this({
            type: "float",
            value
        });
    }

    public static integer(value: number): TypeLiteral {
        return new this({
            type: "integer",
            value
        });
    }

    public static list({
        valueType,
        values,
        isParameter
    }: {
        valueType: Type;
        values: TypeLiteral[];
        isParameter?: boolean;
    }): TypeLiteral {
        return new this({
            type: "list",
            valueType,
            values,
            isParameter
        });
    }

    public static long(value: number): TypeLiteral {
        return new this({
            type: "long",
            value
        });
    }

    public static map({
        keyType,
        valueType,
        entries
    }: {
        keyType: Type;
        valueType: Type;
        entries: MapEntry[];
    }): TypeLiteral {
        return new this({
            type: "map",
            keyType,
            valueType,
            entries
        });
    }

    public static optional({ value, useOf }: { value: TypeLiteral; useOf?: boolean }): TypeLiteral {
        // Avoids double optional.
        if (this.isAlreadyOptional(value)) {
            return value;
        }
        return new this({
            type: "optional",
            value,
            useOf
        });
    }

    public static raw(value: string | AstNode): TypeLiteral {
        return new this({
            type: "raw",
            value
        });
    }

    public static reference(value: AstNode): TypeLiteral {
        return new this({
            type: "reference",
            value
        });
    }

    public static set({ valueType, values }: { valueType: Type; values: TypeLiteral[] }): TypeLiteral {
        return new this({
            type: "set",
            valueType,
            values
        });
    }

    public static string(value: string): TypeLiteral {
        return new this({
            type: "string",
            value
        });
    }

    public static unknown(value: unknown): TypeLiteral {
        return new this({
            type: "unknown",
            value
        });
    }

    public static uuid(value: string): TypeLiteral {
        return new this({
            type: "uuid",
            value
        });
    }

    public static nop(): TypeLiteral {
        return new this({
            type: "nop"
        });
    }

    public static isNop(typeLiteral: TypeLiteral): boolean {
        return typeLiteral.internalType.type === "nop";
    }

    /* Returns true if the type literal should be written on a single line. */
    public shouldWriteInLine(): boolean {
        switch (this.internalType.type) {
            case "bigInteger":
            case "boolean":
            case "bytes":
            case "date":
            case "dateTime":
            case "double":
            case "enum":
            case "float":
            case "integer":
            case "long":
            case "nop":
            case "raw":
            case "string":
            case "unknown":
            case "uuid":
                return true;
            case "optional":
                return this.internalType.value.shouldWriteInLine();
            case "builder":
            case "class":
            case "list":
            case "map":
            case "reference":
            case "set":
                return false;
            default:
                assertNever(this.internalType);
        }
    }

    private writeBigInteger({ writer, bigInteger }: { writer: Writer; bigInteger: BigInteger }): void {
        writer.write("new ");
        writer.writeNode(
            java.instantiateClass({
                classReference: BigIntegerClassReference,
                arguments_: [TypeLiteral.string(bigInteger.value)]
            })
        );
    }

    private writeBuilder({ writer, builder }: { writer: Writer; builder: Builder }): void {
        writer.writeNode(builder.classReference);
        writer.writeNewLineIfLastLineNot();
        writer.indent();
        this.writeBuilderParameters({
            writer,
            parameters: this.orderBuilderParameters(filterNopBuilderParameters({ parameters: builder.parameters }))
        });
        writer.dedent();
    }

    private writeBuilderParameters({ writer, parameters }: { writer: Writer; parameters: BuilderParameter[] }): void {
        writer.writeLine(".builder()");
        for (const parameter of parameters) {
            writer.write(`.${parameter.name}(`);
            if (!parameter.value.shouldWriteInLine()) {
                writer.newLine();
            }
            writer.indent();
            writer.writeNode(parameter.value);
            writer.dedent();
            if (!parameter.value.shouldWriteInLine()) {
                writer.newLine();
            }
            writer.writeLine(")");
        }
        writer.writeNewLineIfLastLineNot();
        writer.write(".build()");
    }

    public orderBuilderParameters(parameters: java.BuilderParameter[]): java.BuilderParameter[] {
        const hasRequiredFields = parameters.some((p) => !p.value.isOptional() && !this.isCollection(p.value));

        if (!hasRequiredFields) {
            return parameters.sort((a, b) => {
                const aIsOptional = a.value.isOptional();
                const bIsOptional = b.value.isOptional();

                if (aIsOptional && !bIsOptional) {
                    return 1;
                }
                if (!aIsOptional && bIsOptional) {
                    return -1;
                }

                return 0;
            });
        }

        return parameters.sort((a, b) => {
            const aIsNonRequired = this.isNonRequired(a.value);
            const bIsNonRequired = this.isNonRequired(b.value);

            if (aIsNonRequired && !bIsNonRequired) {
                return 1;
            }
            if (!aIsNonRequired && bIsNonRequired) {
                return -1;
            }

            return 0;
        });
    }

    private isCollection(value: TypeLiteral): boolean {
        const internalType = value.internalType.type;
        return internalType === "list" || internalType === "set" || internalType === "map";
    }

    private isNonRequired(value: TypeLiteral): boolean {
        return value.isOptional() || this.isCollection(value);
    }

    private writeClass({ writer, class_: class_ }: { writer: Writer; class_: Class_ }): void {
        const parameters = filterNopConstructorParameters({ parameters: class_.parameters });
        writer.writeNode(
            java.instantiateClass({
                classReference: class_.reference,
                arguments_: parameters.map((parameter) => parameter.value)
            })
        );
    }

    private writeDate({ writer, date }: { writer: Writer; date: Date }): void {
        writer.writeNode(
            java.invokeMethod({
                on: LocalDateClassReference,
                method: "parse",
                arguments_: [TypeLiteral.string(date.value)]
            })
        );
    }

    private writeDateTime({ writer, dateTime }: { writer: Writer; dateTime: DateTime }): void {
        writer.writeNode(
            java.invokeMethod({
                on: OffsetDateTimeClassReference,
                method: "parse",
                arguments_: [TypeLiteral.string(dateTime.value)]
            })
        );
    }

    private writeEnum({ writer, enum_: enum_ }: { writer: Writer; enum_: Enum }): void {
        writer.writeNode(enum_.classReference);
        writer.write("." + enum_.value);
    }

    private writeList({ writer, list }: { writer: Writer; list: List }): void {
        this.writeIterable({ writer, iterable: list });
    }

    private writeMap({ writer, map }: { writer: Writer; map: Map }): void {
        const entries = filterNopMapEntries({ entries: map.entries });
        if (entries.length === 0) {
            writer.write("new ");
            writer.writeNode(HashMapClassReference);
            writer.write("<");
            writer.writeNode(map.keyType);
            writer.write(", ");
            writer.writeNode(map.valueType);
            writer.write(">()");
            return;
        }

        writer.write("new ");
        writer.writeNode(HashMapClassReference);
        writer.write("<");
        writer.writeNode(map.keyType);
        writer.write(", ");
        writer.writeNode(map.valueType);
        writer.writeLine(">() {{");
        writer.indent();
        for (const entry of entries) {
            writer.write("put(");
            writer.writeNode(entry.key);
            writer.write(", ");
            writer.writeNode(entry.value);
            writer.writeLine(");");
        }
        writer.dedent();
        writer.write("}}");
    }

    private writeOptional({ writer, optional }: { writer: Writer; optional: Optional }): void {
        if (!optional.useOf) {
            writer.writeNode(optional.value);
            return;
        }
        writer.writeNode(
            java.invokeMethod({
                on: OptionalClassReference,
                method: "of",
                arguments_: [optional.value]
            })
        );
    }

    private writeSet({ writer, set }: { writer: Writer; set: Set }): void {
        this.writeIterable({ writer, iterable: set });
    }

    private writeIterable({ writer, iterable }: { writer: Writer; iterable: List | Set }): void {
        const classReference = iterable.type === "list" ? ArrayListClassReference : HashSetClassReference;
        const values = filterNopValues({ values: iterable.values });

        if (iterable.type === "list" && iterable.isParameter && values.length > 0) {
            writer.writeNode(
                java.invokeMethod({
                    on: ArraysClassReference,
                    method: "asList",
                    arguments_: values
                })
            );
            return;
        }

        if (values.length === 0) {
            writer.write(`new ${classReference.name}<`);
            writer.writeNode(iterable.valueType);
            writer.write(">()");
            return;
        }

        writer.write("new ");
        writer.writeNode(classReference);
        writer.write("<");
        writer.writeNode(iterable.valueType);
        writer.writeLine(">(");
        writer.indent();
        writer.writeNode(
            java.invokeMethod({
                on: ArraysClassReference,
                method: "asList",
                arguments_: values
            })
        );
        writer.writeNewLineIfLastLineNot();
        writer.dedent();
        writer.write(")");
    }

    private writeUnknown({ writer, value }: { writer: Writer; value: unknown }): void {
        switch (typeof value) {
            case "boolean":
                writer.write(value.toString());
                return;
            case "string":
                writer.write(`"${this.escapeString(value)}"`);
                return;
            case "number":
                writer.write(value.toString());
                return;
            case "object":
                if (value == null) {
                    writer.write("null");
                    return;
                }
                if (Array.isArray(value)) {
                    this.writeUnknownArray({ writer, value });
                    return;
                }
                this.writeUnknownMap({ writer, value });
                return;
            default:
                throw new Error(`Internal error; unsupported unknown type: ${typeof value}`);
        }
    }

    private writeUnknownArray({
        writer,
        value
    }: {
        writer: Writer;
        // biome-ignore lint/suspicious/noExplicitAny: allow
        value: any[];
    }): void {
        if (value.length === 0) {
            writer.write("new ");
            writer.writeNode(ArrayListClassReference);
            writer.write("<Object>()");
            return;
        }
        writer.write("new ");
        writer.writeNode(ArrayListClassReference);
        writer.write("<Object>(");
        writer.writeNode(
            java.invokeMethod({
                on: ArraysClassReference,
                method: "asList",
                arguments_: value.map((element) => TypeLiteral.unknown(element))
            })
        );
        writer.write(")");
    }

    private writeUnknownMap({ writer, value }: { writer: Writer; value: object }): void {
        const entries = Object.entries(value);
        if (entries.length === 0) {
            writer.write("new ");
            writer.writeNode(HashMapClassReference);
            writer.write("<String, Object>()");
            return;
        }
        writer.writeLine("new ");
        writer.writeNode(HashMapClassReference);
        writer.write("<String, Object>() {{");
        writer.indent();
        for (const [key, val] of entries) {
            writer.write(`put("${key}", `);
            writer.writeNode(TypeLiteral.unknown(val));
            writer.writeLine(");");
        }
        writer.dedent();
        writer.write("}}");
    }

    private writeUUID({ writer, uuid }: { writer: Writer; uuid: UUID }): void {
        writer.writeNode(
            java.invokeMethod({
                on: UUIDClassReference,
                method: "fromString",
                arguments_: [TypeLiteral.string(uuid.value)]
            })
        );
    }

    private escapeString(input: string): string {
        return input
            .replace(/\\/g, "\\\\") // Escape backslashes
            .replace(/"/g, '\\"') // Escape double quotes
            .replace(/\n/g, "\\n") // Escape newlines
            .replace(/\r/g, "\\r") // Escape carriage returns
            .replace(/\t/g, "\\t"); // Escape tabs
    }

    private static isAlreadyOptional(value: TypeLiteral) {
        return value.internalType.type === "optional";
    }
}

export const ArrayListClassReference = new ClassReference({
    name: "ArrayList",
    packageName: "java.util"
});

export const BigIntegerClassReference = new ClassReference({
    name: "BigInteger",
    packageName: "java.math"
});

export const HashMapClassReference = new ClassReference({
    name: "HashMap",
    packageName: "java.util"
});

export const HashSetClassReference = new ClassReference({
    name: "HashSet",
    packageName: "java.util"
});

export const ListClassReference = new ClassReference({
    name: "List",
    packageName: "java.util"
});

export const LocalDateClassReference = new ClassReference({
    name: "LocalDate",
    packageName: "java.time"
});

export const MapClassReference = new ClassReference({
    name: "Map",
    packageName: "java.util"
});

export const OffsetDateTimeClassReference = new ClassReference({
    name: "OffsetDateTime",
    packageName: "java.time"
});

export const SetClassReference = new ClassReference({
    name: "Set",
    packageName: "java.util"
});

export const UUIDClassReference = new ClassReference({
    name: "UUID",
    packageName: "java.util"
});

function filterNopConstructorParameters({
    parameters
}: {
    parameters: ConstructorParameter[];
}): ConstructorParameter[] {
    return parameters.filter((parameter) => !TypeLiteral.isNop(parameter.value));
}

function filterNopBuilderParameters({ parameters }: { parameters: BuilderParameter[] }): BuilderParameter[] {
    return parameters.filter((parameter) => !TypeLiteral.isNop(parameter.value));
}

function filterNopMapEntries({ entries }: { entries: MapEntry[] }): MapEntry[] {
    return entries.filter((entry) => !TypeLiteral.isNop(entry.key) && !TypeLiteral.isNop(entry.value));
}

function filterNopValues({ values }: { values: TypeLiteral[] }): TypeLiteral[] {
    return values.filter((value) => !TypeLiteral.isNop(value));
}
