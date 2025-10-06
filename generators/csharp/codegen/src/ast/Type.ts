import { assertNever } from "@fern-api/core-utils";
import { PrimitiveTypeV1 } from "@fern-fern/ir-sdk/api";
import { cloneDeep } from "lodash-es";
import { type CSharp } from "../csharp";
import { ClassReference } from "./ClassReference";
import { CoreClassReference } from "./CoreClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { TypeParameter } from "./TypeParameter";

type InternalType =
    | Integer
    | Long
    | Uint
    | Ulong
    | String_
    | Boolean_
    | Float
    | Double
    | DateOnly
    | DateTime
    | Uuid
    | Object_
    | Array_
    | ListType
    | List
    | Set
    | IDictionary
    | Map
    | KeyValuePair
    | Optional
    | Reference
    | OneOf
    | OneOfBase
    | StringEnum
    | CoreReference
    | Action
    | Func
    | FileParameter
    | CsharpType
    | Binary;

interface Integer {
    type: "int";
}

interface Long {
    type: "long";
}

interface Uint {
    type: "uint";
}

interface Ulong {
    type: "ulong";
}

interface String_ {
    type: "string";
}

interface Boolean_ {
    type: "bool";
}

interface Float {
    type: "float";
}

interface Double {
    type: "double";
}

interface DateOnly {
    type: "dateOnly";
}

interface DateTime {
    type: "dateTime";
}

interface Uuid {
    type: "uuid";
}

interface Object_ {
    type: "object";
}

interface Array_ {
    type: "array";
    value: Type;
}

interface ListType {
    type: "listType";
    value: Type;
}

interface List {
    type: "list";
    value: Type;
}

interface Set {
    type: "set";
    value: Type;
}

interface Map {
    type: "map";
    keyType: Type;
    valueType: Type;
    options?: Map.Options;
}

export namespace Map {
    export interface Options {
        dontSimplify?: boolean;
    }
}

interface IDictionary {
    type: "idictionary";
    keyType: Type;
    valueType: Type;
    options?: IDictionary.Options;
}

export namespace IDictionary {
    export interface Options {
        dontSimplify?: boolean;
    }
}

interface KeyValuePair {
    type: "keyValuePair";
    keyType: Type;
    valueType: Type;
}

interface Optional {
    type: "optional";
    value: Type;
}

interface Reference {
    type: "reference";
    value: ClassReference;
}

interface CoreReference {
    type: "coreReference";
    value: CoreClassReference;
}

interface OneOf {
    type: "oneOf";
    memberValues: Type[];
}

interface OneOfBase {
    type: "oneOfBase";
    memberValues: Type[];
}

interface StringEnum {
    type: "stringEnum";
    value: ClassReference;
}

interface Action {
    type: "action";
    typeParameters: (Type | TypeParameter)[];
}

interface Func {
    type: "func";
    typeParameters: (Type | TypeParameter)[];
    returnType: Type | TypeParameter;
}

interface FileParameter {
    type: "fileParam";
    value: ClassReference;
}

interface CsharpType {
    type: "csharpType";
}

interface Binary {
    type: "byte[]";
}

/* A C# parameter to a method */
export class Type extends AstNode {
    constructor(
        public readonly internalType: InternalType,
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer, parentType: Type | undefined = undefined): void {
        switch (this.internalType.type) {
            case "int":
                writer.write("int");
                break;
            case "long":
                writer.write("long");
                break;
            case "uint":
                writer.write("uint");
                break;
            case "ulong":
                writer.write("ulong");
                break;
            case "string":
                writer.write("string");
                break;
            case "bool":
                writer.write("bool");
                break;
            case "float":
                writer.write("float");
                break;
            case "double":
                writer.write("double");
                break;
            case "dateOnly":
                writer.write("DateOnly");
                break;
            case "dateTime":
                writer.write("DateTime");
                break;
            case "uuid":
                writer.write("string");
                break;
            case "object":
                writer.write("object");
                break;
            case "array":
                if (isReadOnlyMemoryType({ writer, value: this.internalType.value })) {
                    this.writeReadOnlyMemoryType({ writer, value: this.internalType.value });
                    break;
                }
                this.internalType.value.write(writer);
                writer.write("[]");
                break;
            case "listType":
                if (isReadOnlyMemoryType({ writer, value: this.internalType.value })) {
                    this.writeReadOnlyMemoryType({ writer, value: this.internalType.value });
                    break;
                }
                writer.write("List<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            case "list":
                if (isReadOnlyMemoryType({ writer, value: this.internalType.value })) {
                    this.writeReadOnlyMemoryType({ writer, value: this.internalType.value });
                    break;
                }
                writer.write("IEnumerable<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            case "set":
                writer.write("HashSet<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            case "idictionary":
            case "map": {
                const keyType = this.internalType.keyType;
                const valueType = this.internalType.valueType;
                if (
                    this.internalType.options?.dontSimplify !== true &&
                    writer.getSimplifyObjectDictionaries() &&
                    keyType.internalType.type === "string" &&
                    valueType.internalType.type === "optional" &&
                    valueType.internalType.value.internalType.type === "object"
                ) {
                    writer.write("object");
                    break;
                }
                const typeName = this.internalType.type === "idictionary" ? "IDictionary" : "Dictionary";
                writer.write(`${typeName}<`);
                keyType.write(writer);
                writer.write(", ");
                valueType.write(writer);
                writer.write(">");
                break;
            }
            case "keyValuePair": {
                const keyType = this.internalType.keyType;
                const valueType = this.internalType.valueType;
                writer.write("KeyValuePair<");
                keyType.write(writer);
                writer.write(", ");
                valueType.write(writer);
                writer.write(">");
                break;
            }
            case "optional":
                this.internalType.value.write(writer, this);
                // avoid double optional
                if (parentType?.internalType?.type !== "optional") {
                    writer.write("?");
                }
                break;
            case "reference":
                writer.writeNode(this.internalType.value);
                break;
            case "coreReference":
                writer.write(this.internalType.value.name);
                break;
            case "oneOf":
                {
                    const oneOf = this.csharp.OneOf.OneOf(this.internalType.memberValues);
                    writer.addReference(oneOf);
                    writer.writeNode(oneOf);
                }

                break;
            case "oneOfBase":
                {
                    const oneOfBase = this.csharp.OneOf.OneOfBase(this.internalType.memberValues);
                    writer.addReference(oneOfBase);
                    writer.writeNode(oneOfBase);
                }
                break;
            case "stringEnum":
                // todo: how to get a proper reference to the <namespace>.StringEnum class
                // at this point? (it has been working because the .Core namespace is always imported I guess)
                // writer.addReference(writer.context.getStringEnumClassReference());
                // formerly writer.addReference(StringEnumClassReference); (from classreference.ts)
                writer.write("StringEnum<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            case "action":
                writer.write("Action");
                if (this.internalType.typeParameters.length > 0) {
                    writer.write("<");
                    this.internalType.typeParameters.forEach((type, index) => {
                        if (index !== 0) {
                            writer.write(", ");
                        }
                        type.write(writer);
                    });
                    writer.write(">");
                }
                break;
            case "func":
                writer.write("Func");
                writer.write("<");
                [...this.internalType.typeParameters, this.internalType.returnType].forEach((type, index) => {
                    if (index !== 0) {
                        writer.write(", ");
                    }
                    type.write(writer);
                });
                writer.write(">");
                break;
            case "csharpType":
                writer.write("global::System.Type");
                break;
            case "fileParam":
                writer.writeNode(this.internalType.value);
                break;
            case "byte[]":
                writer.write("byte[]");
                break;
            default:
                assertNever(this.internalType);
        }
    }

    public writeEmptyCollectionInitializer(writer: Writer): void {
        switch (this.internalType.type) {
            case "list":
                if (isReadOnlyMemoryType({ writer, value: this.internalType.value })) {
                    return;
                }
                writer.write(" = new List<");
                this.internalType.value.write(writer);
                writer.write(">();");
                break;
            case "set":
                writer.write(" = new HashSet<");
                this.internalType.value.write(writer);
                writer.write(">();");
                break;
            case "map":
                writer.write(" = new Dictionary<");
                this.internalType.keyType.write(writer);
                writer.write(", ");
                this.internalType.valueType.write(writer);
                writer.write(">();");
                break;
        }
    }

    public isCollection(): boolean {
        return ["list", "listType", "set", "map", "array"].includes(this.internalType.type);
    }

    public getCollectionItemType(): Type | undefined {
        switch (this.internalType.type) {
            case "list":
            case "listType":
            case "set":
            case "array":
                return this.internalType.value;
            case "map":
                return this.csharp.Type.keyValuePair(this.internalType.keyType, this.internalType.valueType);
            default:
                return undefined;
        }
    }

    public isReferenceType(): boolean | undefined {
        switch (this.internalType.type) {
            case "int":
            case "long":
            case "uint":
            case "ulong":
            case "bool":
            case "float":
            case "double":
            case "dateOnly":
            case "dateTime":
            case "keyValuePair":
            case "stringEnum":
            case "oneOf":
                return false;
            case "string":
            case "uuid": // C# GUID is a value type, but we use string for UUID
            case "object":
            case "array":
            case "listType":
            case "list":
            case "set":
            case "map":
            case "optional":
            case "action":
            case "func":
            case "oneOfBase":
            case "csharpType":
            case "idictionary":
            case "fileParam":
            case "byte[]":
                return true;
            case "reference":
            case "coreReference":
                return undefined;
        }
    }

    public get isAsyncEnumerable(): boolean {
        return this.internalType.type === "reference" && this.internalType.value.isAsyncEnumerable;
    }

    public toOptionalIfNotAlready(): Type {
        if (this.internalType.type === "optional") {
            return this;
        }
        return this.csharp.Type.optional(this);
    }

    public underlyingTypeIfOptional(): Type | undefined {
        if (this.internalType.type === "optional") {
            return (this.internalType as Optional).value;
        }
        return undefined;
    }

    public unwrapIfOptional(): Type {
        if (this.internalType.type === "optional") {
            return (this.internalType as Optional).value;
        }
        return this;
    }

    public isOptional(): boolean {
        return this.internalType.type === "optional";
    }

    public isOneOf(): boolean {
        return this.internalType.type === "oneOf";
    }

    public oneOfTypes() {
        return this.internalType.type === "oneOf" ? this.internalType.memberValues : [];
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        switch (this.internalType.type) {
            case "optional":
                return new Type(
                    {
                        type: "optional",
                        value: this.internalType.value.cloneOptionalWithUnderlyingType(underlyingType)
                    },
                    this.csharp
                );
            default:
                return new Type(cloneDeep(underlyingType.internalType), this.csharp);
        }
    }

    private writeReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): void {
        writer.write("ReadOnlyMemory<");
        value.write(writer);
        writer.write(">");
    }

    static isAlreadyOptional(value: Type) {
        return value.internalType.type === "optional";
    }
}

export function convertReadOnlyPrimitiveTypes(readOnlyMemoryTypeNames: string[]): PrimitiveTypeV1[] {
    return readOnlyMemoryTypeNames.map((typeName) => {
        switch (typeName) {
            case "int":
                return PrimitiveTypeV1.Integer;
            case "long":
                return PrimitiveTypeV1.Long;
            case "uint":
                return PrimitiveTypeV1.Uint;
            case "ulong":
                return PrimitiveTypeV1.Uint64;
            case "string":
                return PrimitiveTypeV1.String;
            case "bool":
                return PrimitiveTypeV1.Boolean;
            case "float":
                return PrimitiveTypeV1.Float;
            case "double":
                return PrimitiveTypeV1.Double;
            default:
                // This should be unreachable; the ReadOnlyMemory types should have already
                // been validated at this point.
                throw new Error(`Internal error; unknown ReadOnlyMemory type: ${typeName}`);
        }
    });
}

function isReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): boolean {
    if (value.internalType.type === "optional") {
        return isReadOnlyMemoryType({ writer, value: value.internalType.value });
    }
    return writer.isReadOnlyMemoryType(value.internalType.type);
}
