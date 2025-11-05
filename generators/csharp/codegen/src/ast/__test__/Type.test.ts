import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { BaseCsharpCustomConfigSchema } from "../..";
import { Generation } from "../../context/generation-info";
import { CoreClassReference } from "../types/CoreClassReference";
import { Type } from "../types/Type";

const generation = new Generation(
    {} as unknown as IntermediateRepresentation,
    "",
    {} as BaseCsharpCustomConfigSchema,
    {} as FernGeneratorExec.config.GeneratorConfig
);

function getTypeOutput(type: Type): string {
    const fullOutput = type.toString({
        namespace: "",
        allNamespaceSegments: new Set<string>(),
        allTypeClassReferences: new Map<string, Set<string>>(),
        generation
    });
    // Extract just the type part, removing any using statements
    const lines = fullOutput.split("\n");
    // Return the last non-empty line which contains the actual type
    return lines.filter((line) => line.trim() !== "").pop() || fullOutput;
}

describe("Type support", () => {
    describe("Primitive types", () => {
        it("string", () => {
            const type = generation.csharp.Type.string;
            expect(getTypeOutput(type)).toBe("string");
        });

        it("boolean", () => {
            const type = generation.csharp.Type.boolean;
            expect(getTypeOutput(type)).toBe("bool");
        });

        it("integer", () => {
            const type = generation.csharp.Type.integer;
            expect(getTypeOutput(type)).toBe("int");
        });

        it("long", () => {
            const type = generation.csharp.Type.long;
            expect(getTypeOutput(type)).toBe("long");
        });

        it("uint", () => {
            const type = generation.csharp.Type.uint;
            expect(getTypeOutput(type)).toBe("uint");
        });

        it("ulong", () => {
            const type = generation.csharp.Type.ulong;
            expect(getTypeOutput(type)).toBe("ulong");
        });

        it("float", () => {
            const type = generation.csharp.Type.float;
            expect(getTypeOutput(type)).toBe("float");
        });

        it("double", () => {
            const type = generation.csharp.Type.double;
            expect(getTypeOutput(type)).toBe("double");
        });

        it("dateOnly", () => {
            const type = generation.csharp.Type.dateOnly;
            expect(getTypeOutput(type)).toBe("DateOnly");
        });

        it("dateTime", () => {
            const type = generation.csharp.Type.dateTime;
            expect(getTypeOutput(type)).toBe("DateTime");
        });

        it("uuid", () => {
            const type = generation.csharp.Type.uuid;
            expect(getTypeOutput(type)).toBe("string");
        });

        it("object", () => {
            const type = generation.csharp.Type.object;
            expect(getTypeOutput(type)).toBe("object");
        });

        it("binary", () => {
            const type = generation.csharp.Type.binary;
            expect(getTypeOutput(type)).toBe("byte[]");
        });
    });

    describe("Optional types", () => {
        it("optional string", () => {
            const type = generation.csharp.Type.optional(generation.csharp.Type.string);
            expect(getTypeOutput(type)).toBe("string?");
        });

        it("optional int", () => {
            const type = generation.csharp.Type.optional(generation.csharp.Type.integer);
            expect(getTypeOutput(type)).toBe("int?");
        });

        it("optional bool", () => {
            const type = generation.csharp.Type.optional(generation.csharp.Type.boolean);
            expect(getTypeOutput(type)).toBe("bool?");
        });

        it("optional long", () => {
            const type = generation.csharp.Type.optional(generation.csharp.Type.long);
            expect(getTypeOutput(type)).toBe("long?");
        });

        it("optional double", () => {
            const type = generation.csharp.Type.optional(generation.csharp.Type.double);
            expect(getTypeOutput(type)).toBe("double?");
        });

        it("optional DateTime", () => {
            const type = generation.csharp.Type.optional(generation.csharp.Type.dateTime);
            expect(getTypeOutput(type)).toBe("DateTime?");
        });

        it("double optional should not add multiple question marks", () => {
            const type = generation.csharp.Type.optional(
                generation.csharp.Type.optional(generation.csharp.Type.integer)
            );
            expect(getTypeOutput(type)).toBe("int?");
        });
    });

    describe("Collection types", () => {
        describe("List", () => {
            it("list of strings", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.string);
                expect(getTypeOutput(type)).toBe("IEnumerable<string>");
            });

            it("list of integers", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.integer);
                expect(getTypeOutput(type)).toBe("IEnumerable<int>");
            });

            it("list of booleans", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.boolean);
                expect(getTypeOutput(type)).toBe("IEnumerable<bool>");
            });

            it("list of optional strings", () => {
                const type = generation.csharp.Type.list(
                    generation.csharp.Type.optional(generation.csharp.Type.string)
                );
                expect(getTypeOutput(type)).toBe("IEnumerable<string?>");
            });

            it("optional list of strings", () => {
                const type = generation.csharp.Type.optional(
                    generation.csharp.Type.list(generation.csharp.Type.string)
                );
                expect(getTypeOutput(type)).toBe("IEnumerable<string>?");
            });

            it("optional list of optional integers", () => {
                const type = generation.csharp.Type.optional(
                    generation.csharp.Type.list(generation.csharp.Type.optional(generation.csharp.Type.integer))
                );
                expect(getTypeOutput(type)).toBe("IEnumerable<int?>?");
            });
        });

        describe("ListType", () => {
            it("listType of strings", () => {
                const type = generation.csharp.Type.listType(generation.csharp.Type.string);
                expect(getTypeOutput(type)).toBe("List<string>");
            });

            it("listType of integers", () => {
                const type = generation.csharp.Type.listType(generation.csharp.Type.integer);
                expect(getTypeOutput(type)).toBe("List<int>");
            });
        });

        describe("Array", () => {
            it("array of strings", () => {
                const type = generation.csharp.Type.array(generation.csharp.Type.string);
                expect(getTypeOutput(type)).toBe("string[]");
            });

            it("array of integers", () => {
                const type = generation.csharp.Type.array(generation.csharp.Type.integer);
                expect(getTypeOutput(type)).toBe("int[]");
            });

            it("array of booleans", () => {
                const type = generation.csharp.Type.array(generation.csharp.Type.boolean);
                expect(getTypeOutput(type)).toBe("bool[]");
            });

            it("optional array of strings", () => {
                const type = generation.csharp.Type.optional(
                    generation.csharp.Type.array(generation.csharp.Type.string)
                );
                expect(getTypeOutput(type)).toBe("string[]?");
            });
        });

        describe("Set", () => {
            it("set of strings", () => {
                const type = generation.csharp.Type.set(generation.csharp.Type.string);
                expect(getTypeOutput(type)).toBe("HashSet<string>");
            });

            it("set of integers", () => {
                const type = generation.csharp.Type.set(generation.csharp.Type.integer);
                expect(getTypeOutput(type)).toBe("HashSet<int>");
            });

            it("optional set of strings", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.set(generation.csharp.Type.string));
                expect(getTypeOutput(type)).toBe("HashSet<string>?");
            });
        });

        describe("Map/Dictionary", () => {
            it("map with string keys and string values", () => {
                const type = generation.csharp.Type.map(generation.csharp.Type.string, generation.csharp.Type.string);
                expect(getTypeOutput(type)).toBe("Dictionary<string, string>");
            });

            it("map with string keys and int values", () => {
                const type = generation.csharp.Type.map(generation.csharp.Type.string, generation.csharp.Type.integer);
                expect(getTypeOutput(type)).toBe("Dictionary<string, int>");
            });

            it("map with int keys and string values", () => {
                const type = generation.csharp.Type.map(generation.csharp.Type.integer, generation.csharp.Type.string);
                expect(getTypeOutput(type)).toBe("Dictionary<int, string>");
            });

            it("map with optional values", () => {
                const type = generation.csharp.Type.map(
                    generation.csharp.Type.string,
                    generation.csharp.Type.optional(generation.csharp.Type.integer)
                );
                expect(getTypeOutput(type)).toBe("Dictionary<string, int?>");
            });

            it("optional map", () => {
                const type = generation.csharp.Type.optional(
                    generation.csharp.Type.map(generation.csharp.Type.string, generation.csharp.Type.string)
                );
                expect(getTypeOutput(type)).toBe("Dictionary<string, string>?");
            });

            it("idictionary with string keys and string values", () => {
                const type = generation.csharp.Type.idictionary(
                    generation.csharp.Type.string,
                    generation.csharp.Type.string
                );
                expect(getTypeOutput(type)).toBe("IDictionary<string, string>");
            });

            it("idictionary with string keys and int values", () => {
                const type = generation.csharp.Type.idictionary(
                    generation.csharp.Type.string,
                    generation.csharp.Type.integer
                );
                expect(getTypeOutput(type)).toBe("IDictionary<string, int>");
            });
        });

        describe("KeyValuePair", () => {
            it("keyValuePair with string key and string value", () => {
                const type = generation.csharp.Type.keyValuePair(
                    generation.csharp.Type.string,
                    generation.csharp.Type.string
                );
                expect(getTypeOutput(type)).toBe("KeyValuePair<string, string>");
            });

            it("keyValuePair with string key and int value", () => {
                const type = generation.csharp.Type.keyValuePair(
                    generation.csharp.Type.string,
                    generation.csharp.Type.integer
                );
                expect(getTypeOutput(type)).toBe("KeyValuePair<string, int>");
            });

            it("optional keyValuePair", () => {
                const type = generation.csharp.Type.optional(
                    generation.csharp.Type.keyValuePair(generation.csharp.Type.string, generation.csharp.Type.integer)
                );
                expect(getTypeOutput(type)).toBe("KeyValuePair<string, int>?");
            });
        });
    });

    describe("Nested collections", () => {
        it("list of lists of strings", () => {
            const type = generation.csharp.Type.list(generation.csharp.Type.list(generation.csharp.Type.string));
            expect(getTypeOutput(type)).toBe("IEnumerable<IEnumerable<string>>");
        });

        it("list of arrays of integers", () => {
            const type = generation.csharp.Type.list(generation.csharp.Type.array(generation.csharp.Type.integer));
            expect(getTypeOutput(type)).toBe("IEnumerable<int[]>");
        });

        it("map with string keys and list values", () => {
            const type = generation.csharp.Type.map(
                generation.csharp.Type.string,
                generation.csharp.Type.list(generation.csharp.Type.integer)
            );
            expect(getTypeOutput(type)).toBe("Dictionary<string, IEnumerable<int>>");
        });

        it("list of maps", () => {
            const type = generation.csharp.Type.list(
                generation.csharp.Type.map(generation.csharp.Type.string, generation.csharp.Type.integer)
            );
            expect(getTypeOutput(type)).toBe("IEnumerable<Dictionary<string, int>>");
        });

        it("set of lists of strings", () => {
            const type = generation.csharp.Type.set(generation.csharp.Type.list(generation.csharp.Type.string));
            expect(getTypeOutput(type)).toBe("HashSet<IEnumerable<string>>");
        });

        it("map of string to map of string to int", () => {
            const type = generation.csharp.Type.map(
                generation.csharp.Type.string,
                generation.csharp.Type.map(generation.csharp.Type.string, generation.csharp.Type.integer)
            );
            expect(getTypeOutput(type)).toBe("Dictionary<string, Dictionary<string, int>>");
        });
    });

    describe("Custom types", () => {
        it("reference to custom class", () => {
            const classRef = generation.csharp.classReference({
                name: "MyCustomClass",
                namespace: "MyNamespace"
            });
            const type = generation.csharp.Type.reference(classRef);
            expect(getTypeOutput(type)).toContain("MyCustomClass");
        });

        it("optional custom class", () => {
            const classRef = generation.csharp.classReference({
                name: "MyCustomClass",
                namespace: "MyNamespace"
            });
            const type = generation.csharp.Type.optional(generation.csharp.Type.reference(classRef));
            expect(getTypeOutput(type)).toContain("MyCustomClass?");
        });

        it("list of custom classes", () => {
            const classRef = generation.csharp.classReference({
                name: "MyCustomClass",
                namespace: "MyNamespace"
            });
            const type = generation.csharp.Type.list(generation.csharp.Type.reference(classRef));
            expect(getTypeOutput(type)).toContain("IEnumerable<MyCustomClass>");
        });

        it("map with custom class values", () => {
            const classRef = generation.csharp.classReference({
                name: "MyCustomClass",
                namespace: "MyNamespace"
            });
            const type = generation.csharp.Type.map(
                generation.csharp.Type.string,
                generation.csharp.Type.reference(classRef)
            );
            expect(getTypeOutput(type)).toContain("Dictionary<string, MyCustomClass>");
        });

        it("custom class with generics", () => {
            const classRef = generation.csharp.classReference({
                name: "GenericClass",
                namespace: "MyNamespace",
                generics: [generation.csharp.Type.string, generation.csharp.Type.integer]
            });
            const type = generation.csharp.Type.reference(classRef);
            expect(getTypeOutput(type)).toContain("GenericClass<string, int>");
        });
    });

    describe("Action and Func delegates", () => {
        it("Action with no parameters", () => {
            const type = generation.csharp.Type.action({ typeParameters: [] });
            expect(getTypeOutput(type)).toBe("Action");
        });

        it("Action with one parameter", () => {
            const type = generation.csharp.Type.action({
                typeParameters: [generation.csharp.Type.string]
            });
            expect(getTypeOutput(type)).toBe("Action<string>");
        });

        it("Action with multiple parameters", () => {
            const type = generation.csharp.Type.action({
                typeParameters: [generation.csharp.Type.string, generation.csharp.Type.integer]
            });
            expect(getTypeOutput(type)).toBe("Action<string, int>");
        });

        it("Func with return type", () => {
            const type = generation.csharp.Type.func({
                typeParameters: [],
                returnType: generation.csharp.Type.string
            });
            expect(getTypeOutput(type)).toBe("Func<string>");
        });

        it("Func with parameters and return type", () => {
            const type = generation.csharp.Type.func({
                typeParameters: [generation.csharp.Type.integer],
                returnType: generation.csharp.Type.string
            });
            expect(getTypeOutput(type)).toBe("Func<int, string>");
        });

        it("Func with multiple parameters and return type", () => {
            const type = generation.csharp.Type.func({
                typeParameters: [generation.csharp.Type.string, generation.csharp.Type.integer],
                returnType: generation.csharp.Type.boolean
            });
            expect(getTypeOutput(type)).toBe("Func<string, int, bool>");
        });

        it("optional Action", () => {
            const type = generation.csharp.Type.optional(
                generation.csharp.Type.action({
                    typeParameters: [generation.csharp.Type.string]
                })
            );
            expect(getTypeOutput(type)).toBe("Action<string>?");
        });

        it("optional Func", () => {
            const type = generation.csharp.Type.optional(
                generation.csharp.Type.func({
                    typeParameters: [generation.csharp.Type.integer],
                    returnType: generation.csharp.Type.string
                })
            );
            expect(getTypeOutput(type)).toBe("Func<int, string>?");
        });
    });

    describe("OneOf types", () => {
        it("oneOf with two types", () => {
            const type = generation.csharp.Type.oneOf([generation.csharp.Type.string, generation.csharp.Type.integer]);
            expect(getTypeOutput(type)).toContain("OneOf<string, int>");
        });

        it("oneOf with three types", () => {
            const type = generation.csharp.Type.oneOf([
                generation.csharp.Type.string,
                generation.csharp.Type.integer,
                generation.csharp.Type.boolean
            ]);
            expect(getTypeOutput(type)).toContain("OneOf<string, int, bool>");
        });

        it("optional oneOf", () => {
            const type = generation.csharp.Type.optional(
                generation.csharp.Type.oneOf([generation.csharp.Type.string, generation.csharp.Type.integer])
            );
            expect(getTypeOutput(type)).toContain("OneOf<string, int>?");
        });

        it("oneOfBase with two types", () => {
            const type = generation.csharp.Type.oneOfBase([
                generation.csharp.Type.string,
                generation.csharp.Type.integer
            ]);
            expect(getTypeOutput(type)).toContain("OneOfBase<string, int>");
        });
    });

    describe("Complex combinations", () => {
        it("optional list of optional custom classes", () => {
            const classRef = generation.csharp.classReference({
                name: "Person",
                namespace: "Models"
            });
            const type = generation.csharp.Type.optional(
                generation.csharp.Type.list(generation.csharp.Type.optional(generation.csharp.Type.reference(classRef)))
            );
            expect(getTypeOutput(type)).toContain("IEnumerable<Person?>?");
        });

        it("map with optional string keys to optional list of integers", () => {
            const type = generation.csharp.Type.map(
                generation.csharp.Type.string,
                generation.csharp.Type.optional(generation.csharp.Type.list(generation.csharp.Type.integer))
            );
            expect(getTypeOutput(type)).toBe("Dictionary<string, IEnumerable<int>?>");
        });

        it("list of maps with custom class values", () => {
            const classRef = generation.csharp.classReference({
                name: "Data",
                namespace: "Models"
            });
            const type = generation.csharp.Type.list(
                generation.csharp.Type.map(generation.csharp.Type.string, generation.csharp.Type.reference(classRef))
            );
            expect(getTypeOutput(type)).toContain("IEnumerable<Dictionary<string, Data>>");
        });

        it("optional set of optional integers", () => {
            const type = generation.csharp.Type.optional(
                generation.csharp.Type.set(generation.csharp.Type.optional(generation.csharp.Type.integer))
            );
            expect(getTypeOutput(type)).toBe("HashSet<int?>?");
        });

        it("oneOf with collection types", () => {
            const type = generation.csharp.Type.oneOf([
                generation.csharp.Type.list(generation.csharp.Type.string),
                generation.csharp.Type.set(generation.csharp.Type.integer)
            ]);
            expect(getTypeOutput(type)).toContain("OneOf<IEnumerable<string>, HashSet<int>>");
        });

        it("Func returning optional list", () => {
            const type = generation.csharp.Type.func({
                typeParameters: [generation.csharp.Type.string],
                returnType: generation.csharp.Type.optional(generation.csharp.Type.list(generation.csharp.Type.integer))
            });
            expect(getTypeOutput(type)).toBe("Func<string, IEnumerable<int>?>");
        });
    });

    describe("systemType", () => {
        it("systemType", () => {
            const type = generation.csharp.Type.systemType;
            expect(getTypeOutput(type)).toBe("global::System.Type");
        });

        it("optional systemType", () => {
            const type = generation.csharp.Type.optional(generation.csharp.Type.systemType);
            expect(getTypeOutput(type)).toBe("global::System.Type?");
        });
    });

    describe("StringEnum and FileParam", () => {
        it("stringEnum", () => {
            const enumRef = generation.csharp.classReference({
                name: "Color",
                namespace: "Enums"
            });
            const type = generation.csharp.Type.stringEnum(enumRef);
            expect(getTypeOutput(type)).toContain("StringEnum<Color>");
        });

        it("optional stringEnum", () => {
            const enumRef = generation.csharp.classReference({
                name: "Color",
                namespace: "Enums"
            });
            const type = generation.csharp.Type.optional(generation.csharp.Type.stringEnum(enumRef));
            expect(getTypeOutput(type)).toContain("StringEnum<Color>?");
        });

        it("fileParam", () => {
            const fileParamRef = generation.csharp.classReference({
                name: "FileParameter",
                namespace: "Core"
            });
            const type = generation.csharp.Type.fileParam(fileParamRef);
            expect(getTypeOutput(type)).toContain("FileParameter");
        });

        it("optional fileParam", () => {
            const fileParamRef = generation.csharp.classReference({
                name: "FileParameter",
                namespace: "Core"
            });
            const type = generation.csharp.Type.optional(generation.csharp.Type.fileParam(fileParamRef));
            expect(getTypeOutput(type)).toContain("FileParameter?");
        });

        it("list of fileParams", () => {
            const fileParamRef = generation.csharp.classReference({
                name: "FileParameter",
                namespace: "Core"
            });
            const type = generation.csharp.Type.list(generation.csharp.Type.fileParam(fileParamRef));
            expect(getTypeOutput(type)).toContain("IEnumerable<FileParameter>");
        });
    });

    describe("Type properties and methods", () => {
        describe("isReferenceType property - comprehensive", () => {
            describe("Value types (isReferenceType = false)", () => {
                it("Integer", () => {
                    expect(generation.csharp.Type.integer.isReferenceType).toBe(false);
                });

                it("Long", () => {
                    expect(generation.csharp.Type.long.isReferenceType).toBe(false);
                });

                it("Uint", () => {
                    expect(generation.csharp.Type.uint.isReferenceType).toBe(false);
                });

                it("ULong", () => {
                    expect(generation.csharp.Type.ulong.isReferenceType).toBe(false);
                });

                it("Boolean", () => {
                    expect(generation.csharp.Type.boolean.isReferenceType).toBe(false);
                });

                it("Float", () => {
                    expect(generation.csharp.Type.float.isReferenceType).toBe(false);
                });

                it("Double", () => {
                    expect(generation.csharp.Type.double.isReferenceType).toBe(false);
                });

                it("DateOnly", () => {
                    expect(generation.csharp.Type.dateOnly.isReferenceType).toBe(false);
                });

                it("DateTime", () => {
                    expect(generation.csharp.Type.dateTime.isReferenceType).toBe(false);
                });

                it("StringEnum", () => {
                    const enumRef = generation.csharp.classReference({
                        name: "Color",
                        namespace: "Enums"
                    });
                    const stringEnum = generation.csharp.Type.stringEnum(enumRef);
                    expect(stringEnum.isReferenceType).toBe(false);
                });

                it("OneOf", () => {
                    const oneOf = generation.csharp.Type.oneOf([
                        generation.csharp.Type.string,
                        generation.csharp.Type.integer
                    ]);
                    expect(oneOf.isReferenceType).toBe(false);
                });

                it("KeyValuePair", () => {
                    const kvp = generation.csharp.Type.keyValuePair(
                        generation.csharp.Type.string,
                        generation.csharp.Type.integer
                    );
                    expect(kvp.isReferenceType).toBe(false);
                });
            });

            describe("Reference types (isReferenceType = true)", () => {
                it("String", () => {
                    expect(generation.csharp.Type.string.isReferenceType).toBe(true);
                });

                it("Uuid (represented as string)", () => {
                    expect(generation.csharp.Type.uuid.isReferenceType).toBe(true);
                });

                it("Object", () => {
                    expect(generation.csharp.Type.object.isReferenceType).toBe(true);
                });

                it("List", () => {
                    const list = generation.csharp.Type.list(generation.csharp.Type.string);
                    expect(list.isReferenceType).toBe(true);
                });

                it("ListType", () => {
                    const listType = generation.csharp.Type.listType(generation.csharp.Type.string);
                    expect(listType.isReferenceType).toBe(true);
                });

                it("Set", () => {
                    const set = generation.csharp.Type.set(generation.csharp.Type.integer);
                    expect(set.isReferenceType).toBe(true);
                });

                it("Map", () => {
                    const map = generation.csharp.Type.map(
                        generation.csharp.Type.string,
                        generation.csharp.Type.integer
                    );
                    expect(map.isReferenceType).toBe(true);
                });

                it("IDictionary", () => {
                    const dict = generation.csharp.Type.idictionary(
                        generation.csharp.Type.string,
                        generation.csharp.Type.integer
                    );
                    expect(dict.isReferenceType).toBe(true);
                });

                it("OneOfBase", () => {
                    const oneOfBase = generation.csharp.Type.oneOfBase([
                        generation.csharp.Type.string,
                        generation.csharp.Type.integer
                    ]);
                    expect(oneOfBase.isReferenceType).toBe(true);
                });

                it("Array", () => {
                    const array = generation.csharp.Type.array(generation.csharp.Type.string);
                    expect(array.isReferenceType).toBe(true);
                });

                it("FileParameter", () => {
                    const fileParamRef = generation.csharp.classReference({
                        name: "FileParameter",
                        namespace: "Core"
                    });
                    const fileParam = generation.csharp.Type.fileParam(fileParamRef);
                    expect(fileParam.isReferenceType).toBe(true);
                });

                it("Action", () => {
                    const action = generation.csharp.Type.action({ typeParameters: [] });
                    expect(action.isReferenceType).toBe(true);
                });

                it("Func", () => {
                    const func = generation.csharp.Type.func({
                        typeParameters: [],
                        returnType: generation.csharp.Type.string
                    });
                    expect(func.isReferenceType).toBe(true);
                });

                it("SystemType", () => {
                    expect(generation.csharp.Type.systemType.isReferenceType).toBe(true);
                });

                it("Binary", () => {
                    expect(generation.csharp.Type.binary.isReferenceType).toBe(true);
                });
            });

            describe("Types with undefined isReferenceType", () => {
                it("Reference to custom class", () => {
                    const classRef = generation.csharp.classReference({
                        name: "MyClass",
                        namespace: "MyNamespace"
                    });
                    const type = generation.csharp.Type.reference(classRef);
                    expect(type.isReferenceType).toBe(undefined);
                });

                it("CoreReference", () => {
                    const coreRef = new CoreClassReference({ name: "MyCore" }, generation);
                    const type = generation.csharp.Type.coreClass(coreRef);
                    expect(type.isReferenceType).toBe(undefined);
                });
            });

            describe("Optional types are always reference types", () => {
                it("optional value type becomes reference type", () => {
                    const optionalInt = generation.csharp.Type.optional(generation.csharp.Type.integer);
                    // Optional value types become nullable reference types
                    expect(optionalInt.isReferenceType).toBe(true);
                });

                it("optional reference type remains reference type", () => {
                    const optionalString = generation.csharp.Type.optional(generation.csharp.Type.string);
                    // Optional reference types remain nullable reference types
                    expect(optionalString.isReferenceType).toBe(true);
                });
            });
        });

        describe("isOptional property - comprehensive", () => {
            it("primitive types are not optional", () => {
                expect(generation.csharp.Type.string.isOptional).toBe(false);
                expect(generation.csharp.Type.integer.isOptional).toBe(false);
                expect(generation.csharp.Type.boolean.isOptional).toBe(false);
                expect(generation.csharp.Type.double.isOptional).toBe(false);
                expect(generation.csharp.Type.long.isOptional).toBe(false);
                expect(generation.csharp.Type.uint.isOptional).toBe(false);
                expect(generation.csharp.Type.ulong.isOptional).toBe(false);
                expect(generation.csharp.Type.float.isOptional).toBe(false);
                expect(generation.csharp.Type.dateOnly.isOptional).toBe(false);
                expect(generation.csharp.Type.dateTime.isOptional).toBe(false);
                expect(generation.csharp.Type.uuid.isOptional).toBe(false);
                expect(generation.csharp.Type.binary.isOptional).toBe(false);
            });

            it("object types are not optional", () => {
                expect(generation.csharp.Type.object.isOptional).toBe(false);
            });

            it("collections are not optional by default", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.string);
                expect(list.isOptional).toBe(false);

                const set = generation.csharp.Type.set(generation.csharp.Type.integer);
                expect(set.isOptional).toBe(false);

                const array = generation.csharp.Type.array(generation.csharp.Type.string);
                expect(array.isOptional).toBe(false);
            });

            it("optional wrapper makes types optional", () => {
                const optionalString = generation.csharp.Type.optional(generation.csharp.Type.string);
                expect(optionalString.isOptional).toBe(true);

                const optionalInt = generation.csharp.Type.optional(generation.csharp.Type.integer);
                expect(optionalInt.isOptional).toBe(true);
            });

            it("optional collections are optional", () => {
                const optionalList = generation.csharp.Type.optional(
                    generation.csharp.Type.list(generation.csharp.Type.string)
                );
                expect(optionalList.isOptional).toBe(true);
            });

            it("delegates are not optional by default", () => {
                const action = generation.csharp.Type.action({ typeParameters: [] });
                expect(action.isOptional).toBe(false);

                const func = generation.csharp.Type.func({
                    typeParameters: [],
                    returnType: generation.csharp.Type.string
                });
                expect(func.isOptional).toBe(false);
            });

            it("special types are not optional by default", () => {
                expect(generation.csharp.Type.systemType.isOptional).toBe(false);

                const fileParamRef = generation.csharp.classReference({
                    name: "FileParameter",
                    namespace: "Core"
                });
                const fileParam = generation.csharp.Type.fileParam(fileParamRef);
                expect(fileParam.isOptional).toBe(false);
            });
        });

        describe("isCollection property - comprehensive", () => {
            it("primitive types are not collections", () => {
                expect(generation.csharp.Type.string.isCollection).toBe(false);
                expect(generation.csharp.Type.integer.isCollection).toBe(false);
                expect(generation.csharp.Type.boolean.isCollection).toBe(false);
                expect(generation.csharp.Type.long.isCollection).toBe(false);
                expect(generation.csharp.Type.double.isCollection).toBe(false);
            });

            it("List is a collection", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.string);
                expect(list.isCollection).toBe(true);
            });

            it("ListType is a collection", () => {
                const listType = generation.csharp.Type.listType(generation.csharp.Type.string);
                expect(listType.isCollection).toBe(true);
            });

            it("Set is a collection", () => {
                const set = generation.csharp.Type.set(generation.csharp.Type.integer);
                expect(set.isCollection).toBe(true);
            });

            it("Map is a collection", () => {
                const map = generation.csharp.Type.map(generation.csharp.Type.string, generation.csharp.Type.integer);
                expect(map.isCollection).toBe(true);
            });

            it("IDictionary is a collection", () => {
                const dict = generation.csharp.Type.idictionary(
                    generation.csharp.Type.string,
                    generation.csharp.Type.integer
                );
                expect(dict.isCollection).toBe(true);
            });

            it("Array is NOT marked as collection (special case)", () => {
                const array = generation.csharp.Type.array(generation.csharp.Type.string);
                expect(array.isCollection).toBe(false);
            });

            it("KeyValuePair is not a collection", () => {
                const kvp = generation.csharp.Type.keyValuePair(
                    generation.csharp.Type.string,
                    generation.csharp.Type.integer
                );
                expect(kvp.isCollection).toBe(false);
            });

            it("OneOf is not a collection", () => {
                const oneOf = generation.csharp.Type.oneOf([
                    generation.csharp.Type.string,
                    generation.csharp.Type.integer
                ]);
                expect(oneOf.isCollection).toBe(false);
            });

            it("optional collection - isCollection", () => {
                const optionalList = generation.csharp.Type.optional(
                    generation.csharp.Type.list(generation.csharp.Type.string)
                );
                expect(optionalList.isCollection).toBe(false);
            });

            it("special types are not collections", () => {
                expect(generation.csharp.Type.systemType.isCollection).toBe(false);
                expect(generation.csharp.Type.binary.isCollection).toBe(false);

                const action = generation.csharp.Type.action({ typeParameters: [] });
                expect(action.isCollection).toBe(false);

                const func = generation.csharp.Type.func({
                    typeParameters: [],
                    returnType: generation.csharp.Type.string
                });
                expect(func.isCollection).toBe(false);
            });
        });

        describe("underlyingTypeIfOptional method", () => {
            it("returns undefined for non-optional types", () => {
                expect(generation.csharp.Type.string.underlyingTypeIfOptional()).toBeUndefined();
                expect(generation.csharp.Type.integer.underlyingTypeIfOptional()).toBeUndefined();
            });

            it("returns underlying type for optional types", () => {
                const optionalString = generation.csharp.Type.optional(generation.csharp.Type.string);
                const underlying = optionalString.underlyingTypeIfOptional();
                expect(underlying).toBeDefined();
                if (underlying) {
                    expect(getTypeOutput(underlying)).toBe("string");
                }
            });

            it("returns underlying type for optional custom types", () => {
                const classRef = generation.csharp.classReference({
                    name: "Person",
                    namespace: "Models"
                });
                const optionalPerson = generation.csharp.Type.optional(generation.csharp.Type.reference(classRef));
                const underlying = optionalPerson.underlyingTypeIfOptional();
                expect(underlying).toBeDefined();
                if (underlying) {
                    expect(getTypeOutput(underlying)).toContain("Person");
                }
            });
        });

        describe("unwrapIfOptional method", () => {
            it("returns self for non-optional types", () => {
                const stringType = generation.csharp.Type.string;
                expect(stringType.unwrapIfOptional()).toBe(stringType);
            });

            it("unwraps optional types", () => {
                const optionalInt = generation.csharp.Type.optional(generation.csharp.Type.integer);
                const unwrapped = optionalInt.unwrapIfOptional();
                expect(unwrapped.isOptional).toBe(false);
                expect(getTypeOutput(unwrapped)).toBe("int");
            });

            it("unwraps optional collections", () => {
                const optionalList = generation.csharp.Type.optional(
                    generation.csharp.Type.list(generation.csharp.Type.string)
                );
                const unwrapped = optionalList.unwrapIfOptional();
                expect(unwrapped.isOptional).toBe(false);
                expect(getTypeOutput(unwrapped)).toBe("IEnumerable<string>");
            });
        });

        describe("getCollectionItemType method", () => {
            it("returns undefined for non-collection types", () => {
                expect(generation.csharp.Type.string.getCollectionItemType()).toBeUndefined();
                expect(generation.csharp.Type.integer.getCollectionItemType()).toBeUndefined();
            });

            it("returns item type for list", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.string);
                const itemType = list.getCollectionItemType();
                expect(itemType).toBeDefined();
                if (itemType) {
                    expect(getTypeOutput(itemType)).toBe("string");
                }
            });

            it("returns item type for set", () => {
                const set = generation.csharp.Type.set(generation.csharp.Type.integer);
                const itemType = set.getCollectionItemType();
                expect(itemType).toBeDefined();
                if (itemType) {
                    expect(getTypeOutput(itemType)).toBe("int");
                }
            });

            it("returns item type for array", () => {
                const array = generation.csharp.Type.array(generation.csharp.Type.boolean);
                const itemType = array.getCollectionItemType();
                expect(itemType).toBeDefined();
                if (itemType) {
                    expect(getTypeOutput(itemType)).toBe("bool");
                }
            });

            it("returns KeyValuePair for map", () => {
                const map = generation.csharp.Type.map(generation.csharp.Type.string, generation.csharp.Type.integer);
                const itemType = map.getCollectionItemType();
                expect(itemType).toBeDefined();
                if (itemType) {
                    expect(getTypeOutput(itemType)).toContain("KeyValuePair");
                }
            });

            it("returns nested item type for nested collections", () => {
                const nestedList = generation.csharp.Type.list(
                    generation.csharp.Type.list(generation.csharp.Type.string)
                );
                const outerItemType = nestedList.getCollectionItemType();
                expect(outerItemType).toBeDefined();
                if (outerItemType) {
                    expect(getTypeOutput(outerItemType)).toBe("IEnumerable<string>");

                    const innerItemType = outerItemType.getCollectionItemType();
                    expect(innerItemType).toBeDefined();
                    if (innerItemType) {
                        expect(getTypeOutput(innerItemType)).toBe("string");
                    }
                }
            });
        });

        describe("toOptionalIfNotAlready method", () => {
            it("makes non-optional types optional", () => {
                const stringType = generation.csharp.Type.string;
                const optionalString = stringType.toOptionalIfNotAlready();
                expect(optionalString.isOptional).toBe(true);
                expect(getTypeOutput(optionalString)).toBe("string?");
            });

            it("does not double-wrap already optional types", () => {
                const optionalInt = generation.csharp.Type.optional(generation.csharp.Type.integer);
                const doubleOptional = optionalInt.toOptionalIfNotAlready();
                expect(doubleOptional.isOptional).toBe(true);
                expect(getTypeOutput(doubleOptional)).toBe("int?");
            });

            it("makes collections optional", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.string);
                const optionalList = list.toOptionalIfNotAlready();
                expect(optionalList.isOptional).toBe(true);
                expect(getTypeOutput(optionalList)).toBe("IEnumerable<string>?");
            });
        });

        describe("multipartMethodName property", () => {
            it("primitives use AddStringPart", () => {
                expect(generation.csharp.Type.string.multipartMethodName).toBe("AddStringPart");
                expect(generation.csharp.Type.integer.multipartMethodName).toBe("AddStringPart");
                expect(generation.csharp.Type.boolean.multipartMethodName).toBe("AddStringPart");
            });

            it("list delegates to inner type's collection method name", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.string);
                expect(list.multipartMethodName).toBe("AddStringParts");

                const listInt = generation.csharp.Type.list(generation.csharp.Type.integer);
                expect(listInt.multipartMethodName).toBe("AddStringParts");
            });

            it("set uses default collection AddJsonPart", () => {
                const set = generation.csharp.Type.set(generation.csharp.Type.integer);
                expect(set.multipartMethodName).toBe("AddJsonPart");
            });

            it("object types use AddJsonPart", () => {
                expect(generation.csharp.Type.object.multipartMethodName).toBe("AddJsonPart");
            });
        });

        describe("multipartMethodNameForCollection property", () => {
            it("primitives use AddStringParts", () => {
                expect(generation.csharp.Type.string.multipartMethodNameForCollection).toBe("AddStringParts");
                expect(generation.csharp.Type.integer.multipartMethodNameForCollection).toBe("AddStringParts");
            });

            it("list delegates to inner type's collection method name", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.string);
                expect(list.multipartMethodNameForCollection).toBe("AddStringParts");

                const listInt = generation.csharp.Type.list(generation.csharp.Type.integer);
                expect(listInt.multipartMethodNameForCollection).toBe("AddStringParts");
            });

            it("set uses default collection AddJsonParts", () => {
                const set = generation.csharp.Type.set(generation.csharp.Type.integer);
                expect(set.multipartMethodNameForCollection).toBe("AddJsonParts");
            });
        });

        describe("isAsyncEnumerable property", () => {
            it("regular types are not async enumerable", () => {
                expect(generation.csharp.Type.string.isAsyncEnumerable).toBe(false);
                expect(generation.csharp.Type.integer.isAsyncEnumerable).toBe(false);
            });

            it("collections are not async enumerable by default", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.string);
                expect(list.isAsyncEnumerable).toBe(false);
            });
        });

        describe("COMPREHENSIVE: Optional variants of ALL types", () => {
            it("Optional<Integer>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.integer);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("int?");
            });

            it("Optional<Long>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.long);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("long?");
            });

            it("Optional<Uint>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.uint);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("uint?");
            });

            it("Optional<ULong>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.ulong);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("ulong?");
            });

            it("Optional<Boolean>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.boolean);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("bool?");
            });

            it("Optional<Float>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.float);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("float?");
            });

            it("Optional<Double>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.double);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("double?");
            });

            it("Optional<DateOnly>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.dateOnly);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("DateOnly?");
            });

            it("Optional<DateTime>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.dateTime);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("DateTime?");
            });

            it("Optional<String>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.string);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("string?");
            });

            it("Optional<Uuid>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.uuid);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("string?");
            });

            it("Optional<Binary>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.binary);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("byte[]?");
            });

            it("Optional<Object>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.object);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("object?");
            });

            it("Optional<SystemType>", () => {
                const type = generation.csharp.Type.optional(generation.csharp.Type.systemType);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("global::System.Type?");
            });

            it("Optional<Action>", () => {
                const action = generation.csharp.Type.action({ typeParameters: [generation.csharp.Type.string] });
                const type = generation.csharp.Type.optional(action);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("Action<string>?");
            });

            it("Optional<Func>", () => {
                const func = generation.csharp.Type.func({
                    typeParameters: [generation.csharp.Type.integer],
                    returnType: generation.csharp.Type.string
                });
                const type = generation.csharp.Type.optional(func);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("Func<int, string>?");
            });

            it("Optional<CustomClass>", () => {
                const classRef = generation.csharp.classReference({ name: "Person", namespace: "Models" });
                const type = generation.csharp.Type.optional(generation.csharp.Type.reference(classRef));
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toContain("Person?");
            });

            it("Optional<StringEnum>", () => {
                const enumRef = generation.csharp.classReference({ name: "Color", namespace: "Enums" });
                const stringEnum = generation.csharp.Type.stringEnum(enumRef);
                const type = generation.csharp.Type.optional(stringEnum);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toContain("StringEnum<Color>?");
            });

            it("Optional<FileParameter>", () => {
                const fileParamRef = generation.csharp.classReference({ name: "FileParameter", namespace: "Core" });
                const fileParam = generation.csharp.Type.fileParam(fileParamRef);
                const type = generation.csharp.Type.optional(fileParam);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toContain("FileParameter?");
            });

            it("Optional<OneOf>", () => {
                const oneOf = generation.csharp.Type.oneOf([
                    generation.csharp.Type.string,
                    generation.csharp.Type.integer
                ]);
                const type = generation.csharp.Type.optional(oneOf);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toContain("OneOf<string, int>?");
            });

            it("Optional<KeyValuePair>", () => {
                const kvp = generation.csharp.Type.keyValuePair(
                    generation.csharp.Type.string,
                    generation.csharp.Type.integer
                );
                const type = generation.csharp.Type.optional(kvp);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("KeyValuePair<string, int>?");
            });
        });

        describe("COMPREHENSIVE: List of ALL types", () => {
            it("List<Integer>", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.integer);
                expect(getTypeOutput(type)).toBe("IEnumerable<int>");
            });

            it("List<Long>", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.long);
                expect(getTypeOutput(type)).toBe("IEnumerable<long>");
            });

            it("List<Boolean>", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.boolean);
                expect(getTypeOutput(type)).toBe("IEnumerable<bool>");
            });

            it("List<Float>", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.float);
                expect(getTypeOutput(type)).toBe("IEnumerable<float>");
            });

            it("List<Double>", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.double);
                expect(getTypeOutput(type)).toBe("IEnumerable<double>");
            });

            it("List<DateOnly>", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.dateOnly);
                expect(getTypeOutput(type)).toBe("IEnumerable<DateOnly>");
            });

            it("List<DateTime>", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.dateTime);
                expect(getTypeOutput(type)).toBe("IEnumerable<DateTime>");
            });

            it("List<String>", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.string);
                expect(getTypeOutput(type)).toBe("IEnumerable<string>");
            });

            it("List<Uuid>", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.uuid);
                expect(getTypeOutput(type)).toBe("IEnumerable<string>");
            });

            it("List<Binary>", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.binary);
                expect(getTypeOutput(type)).toBe("IEnumerable<byte[]>");
            });

            it("List<Object>", () => {
                const type = generation.csharp.Type.list(generation.csharp.Type.object);
                expect(getTypeOutput(type)).toBe("IEnumerable<object>");
            });

            it("List<CustomClass>", () => {
                const classRef = generation.csharp.classReference({ name: "Person", namespace: "Models" });
                const type = generation.csharp.Type.list(generation.csharp.Type.reference(classRef));
                expect(getTypeOutput(type)).toContain("IEnumerable<Person>");
            });

            it("List<OneOf>", () => {
                const oneOf = generation.csharp.Type.oneOf([
                    generation.csharp.Type.string,
                    generation.csharp.Type.integer
                ]);
                const type = generation.csharp.Type.list(oneOf);
                expect(getTypeOutput(type)).toContain("IEnumerable<OneOf<string, int>>");
            });

            it("List<KeyValuePair>", () => {
                const kvp = generation.csharp.Type.keyValuePair(
                    generation.csharp.Type.string,
                    generation.csharp.Type.integer
                );
                const type = generation.csharp.Type.list(kvp);
                expect(getTypeOutput(type)).toBe("IEnumerable<KeyValuePair<string, int>>");
            });

            it("List<List<Integer>>", () => {
                const innerList = generation.csharp.Type.list(generation.csharp.Type.integer);
                const type = generation.csharp.Type.list(innerList);
                expect(getTypeOutput(type)).toBe("IEnumerable<IEnumerable<int>>");
            });

            it("List<Array<String>>", () => {
                const array = generation.csharp.Type.array(generation.csharp.Type.string);
                const type = generation.csharp.Type.list(array);
                expect(getTypeOutput(type)).toBe("IEnumerable<string[]>");
            });

            it("List<Set<Integer>>", () => {
                const set = generation.csharp.Type.set(generation.csharp.Type.integer);
                const type = generation.csharp.Type.list(set);
                expect(getTypeOutput(type)).toBe("IEnumerable<HashSet<int>>");
            });
        });

        describe("COMPREHENSIVE: Optional List of ALL types", () => {
            it("Optional<List<Integer>>", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.integer);
                const type = generation.csharp.Type.optional(list);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("IEnumerable<int>?");
            });

            it("Optional<List<String>>", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.string);
                const type = generation.csharp.Type.optional(list);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("IEnumerable<string>?");
            });

            it("Optional<List<Boolean>>", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.boolean);
                const type = generation.csharp.Type.optional(list);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("IEnumerable<bool>?");
            });

            it("Optional<List<Double>>", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.double);
                const type = generation.csharp.Type.optional(list);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("IEnumerable<double>?");
            });

            it("Optional<List<DateTime>>", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.dateTime);
                const type = generation.csharp.Type.optional(list);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("IEnumerable<DateTime>?");
            });

            it("Optional<List<CustomClass>>", () => {
                const classRef = generation.csharp.classReference({ name: "Person", namespace: "Models" });
                const list = generation.csharp.Type.list(generation.csharp.Type.reference(classRef));
                const type = generation.csharp.Type.optional(list);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toContain("IEnumerable<Person>?");
            });
        });

        describe("COMPREHENSIVE: List of Optional ALL types", () => {
            it("List<Optional<Integer>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.integer);
                const type = generation.csharp.Type.list(optional);
                expect(getTypeOutput(type)).toBe("IEnumerable<int?>");
            });

            it("List<Optional<String>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.string);
                const type = generation.csharp.Type.list(optional);
                expect(getTypeOutput(type)).toBe("IEnumerable<string?>");
            });

            it("List<Optional<Boolean>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.boolean);
                const type = generation.csharp.Type.list(optional);
                expect(getTypeOutput(type)).toBe("IEnumerable<bool?>");
            });

            it("List<Optional<Double>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.double);
                const type = generation.csharp.Type.list(optional);
                expect(getTypeOutput(type)).toBe("IEnumerable<double?>");
            });

            it("List<Optional<DateTime>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.dateTime);
                const type = generation.csharp.Type.list(optional);
                expect(getTypeOutput(type)).toBe("IEnumerable<DateTime?>");
            });

            it("List<Optional<CustomClass>>", () => {
                const classRef = generation.csharp.classReference({ name: "Person", namespace: "Models" });
                const optional = generation.csharp.Type.optional(generation.csharp.Type.reference(classRef));
                const type = generation.csharp.Type.list(optional);
                expect(getTypeOutput(type)).toContain("IEnumerable<Person?>");
            });

            it("List<Optional<OneOf>>", () => {
                const oneOf = generation.csharp.Type.oneOf([
                    generation.csharp.Type.string,
                    generation.csharp.Type.integer
                ]);
                const optional = generation.csharp.Type.optional(oneOf);
                const type = generation.csharp.Type.list(optional);
                expect(getTypeOutput(type)).toContain("IEnumerable<OneOf<string, int>?>");
            });
        });

        describe("COMPREHENSIVE: Optional List of Optional ALL types", () => {
            it("Optional<List<Optional<Integer>>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.integer);
                const list = generation.csharp.Type.list(optional);
                const type = generation.csharp.Type.optional(list);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("IEnumerable<int?>?");
            });

            it("Optional<List<Optional<String>>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.string);
                const list = generation.csharp.Type.list(optional);
                const type = generation.csharp.Type.optional(list);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("IEnumerable<string?>?");
            });

            it("Optional<List<Optional<Boolean>>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.boolean);
                const list = generation.csharp.Type.list(optional);
                const type = generation.csharp.Type.optional(list);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toBe("IEnumerable<bool?>?");
            });

            it("Optional<List<Optional<CustomClass>>>", () => {
                const classRef = generation.csharp.classReference({ name: "Person", namespace: "Models" });
                const optional = generation.csharp.Type.optional(generation.csharp.Type.reference(classRef));
                const list = generation.csharp.Type.list(optional);
                const type = generation.csharp.Type.optional(list);
                expect(type.isOptional).toBe(true);
                expect(getTypeOutput(type)).toContain("IEnumerable<Person?>?");
            });
        });

        describe("COMPREHENSIVE: Set of ALL types", () => {
            it("Set<Integer>", () => {
                const type = generation.csharp.Type.set(generation.csharp.Type.integer);
                expect(getTypeOutput(type)).toBe("HashSet<int>");
            });

            it("Set<String>", () => {
                const type = generation.csharp.Type.set(generation.csharp.Type.string);
                expect(getTypeOutput(type)).toBe("HashSet<string>");
            });

            it("Set<Boolean>", () => {
                const type = generation.csharp.Type.set(generation.csharp.Type.boolean);
                expect(getTypeOutput(type)).toBe("HashSet<bool>");
            });

            it("Set<CustomClass>", () => {
                const classRef = generation.csharp.classReference({ name: "Person", namespace: "Models" });
                const type = generation.csharp.Type.set(generation.csharp.Type.reference(classRef));
                expect(getTypeOutput(type)).toContain("HashSet<Person>");
            });

            it("Optional<Set<Integer>>", () => {
                const set = generation.csharp.Type.set(generation.csharp.Type.integer);
                const type = generation.csharp.Type.optional(set);
                expect(getTypeOutput(type)).toBe("HashSet<int>?");
            });

            it("Set<Optional<Integer>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.integer);
                const type = generation.csharp.Type.set(optional);
                expect(getTypeOutput(type)).toBe("HashSet<int?>");
            });

            it("Optional<Set<Optional<String>>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.string);
                const set = generation.csharp.Type.set(optional);
                const type = generation.csharp.Type.optional(set);
                expect(getTypeOutput(type)).toBe("HashSet<string?>?");
            });
        });

        describe("COMPREHENSIVE: Array of ALL types", () => {
            it("Array<Integer>", () => {
                const type = generation.csharp.Type.array(generation.csharp.Type.integer);
                expect(getTypeOutput(type)).toBe("int[]");
            });

            it("Array<String>", () => {
                const type = generation.csharp.Type.array(generation.csharp.Type.string);
                expect(getTypeOutput(type)).toBe("string[]");
            });

            it("Array<Boolean>", () => {
                const type = generation.csharp.Type.array(generation.csharp.Type.boolean);
                expect(getTypeOutput(type)).toBe("bool[]");
            });

            it("Array<Double>", () => {
                const type = generation.csharp.Type.array(generation.csharp.Type.double);
                expect(getTypeOutput(type)).toBe("double[]");
            });

            it("Array<CustomClass>", () => {
                const classRef = generation.csharp.classReference({ name: "Person", namespace: "Models" });
                const type = generation.csharp.Type.array(generation.csharp.Type.reference(classRef));
                expect(getTypeOutput(type)).toContain("Person[]");
            });

            it("Optional<Array<Integer>>", () => {
                const array = generation.csharp.Type.array(generation.csharp.Type.integer);
                const type = generation.csharp.Type.optional(array);
                expect(getTypeOutput(type)).toBe("int[]?");
            });

            it("Array<Optional<String>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.string);
                const type = generation.csharp.Type.array(optional);
                expect(getTypeOutput(type)).toBe("string?[]");
            });

            it("Optional<Array<Optional<Integer>>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.integer);
                const array = generation.csharp.Type.array(optional);
                const type = generation.csharp.Type.optional(array);
                expect(getTypeOutput(type)).toBe("int?[]?");
            });
        });

        describe("COMPREHENSIVE: Map/Dictionary combinations", () => {
            it("Map<Integer, String>", () => {
                const type = generation.csharp.Type.map(generation.csharp.Type.integer, generation.csharp.Type.string);
                expect(getTypeOutput(type)).toBe("Dictionary<int, string>");
            });

            it("Map<String, Optional<Integer>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.integer);
                const type = generation.csharp.Type.map(generation.csharp.Type.string, optional);
                expect(getTypeOutput(type)).toBe("Dictionary<string, int?>");
            });

            it("Optional<Map<String, Integer>>", () => {
                const map = generation.csharp.Type.map(generation.csharp.Type.string, generation.csharp.Type.integer);
                const type = generation.csharp.Type.optional(map);
                expect(getTypeOutput(type)).toBe("Dictionary<string, int>?");
            });

            it("Optional<Map<String, Optional<Boolean>>>", () => {
                const optional = generation.csharp.Type.optional(generation.csharp.Type.boolean);
                const map = generation.csharp.Type.map(generation.csharp.Type.string, optional);
                const type = generation.csharp.Type.optional(map);
                expect(getTypeOutput(type)).toBe("Dictionary<string, bool?>?");
            });

            it("Map<String, List<Integer>>", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.integer);
                const type = generation.csharp.Type.map(generation.csharp.Type.string, list);
                expect(getTypeOutput(type)).toBe("Dictionary<string, IEnumerable<int>>");
            });

            it("Map<String, Optional<List<Integer>>>", () => {
                const list = generation.csharp.Type.list(generation.csharp.Type.integer);
                const optional = generation.csharp.Type.optional(list);
                const type = generation.csharp.Type.map(generation.csharp.Type.string, optional);
                expect(getTypeOutput(type)).toBe("Dictionary<string, IEnumerable<int>?>");
            });

            it("List<Map<String, Integer>>", () => {
                const map = generation.csharp.Type.map(generation.csharp.Type.string, generation.csharp.Type.integer);
                const type = generation.csharp.Type.list(map);
                expect(getTypeOutput(type)).toBe("IEnumerable<Dictionary<string, int>>");
            });

            it("Optional<List<Map<String, Optional<CustomClass>>>>", () => {
                const classRef = generation.csharp.classReference({ name: "Data", namespace: "Models" });
                const optional = generation.csharp.Type.optional(generation.csharp.Type.reference(classRef));
                const map = generation.csharp.Type.map(generation.csharp.Type.string, optional);
                const list = generation.csharp.Type.list(map);
                const type = generation.csharp.Type.optional(list);
                expect(getTypeOutput(type)).toContain("IEnumerable<Dictionary<string, Data?>>");
            });
        });
    });
});
