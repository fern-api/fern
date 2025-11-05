import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ast, BaseCsharpCustomConfigSchema } from "../..";
import { Generation } from "../../context/generation-info";

const generation = new Generation(
    {} as unknown as IntermediateRepresentation,
    "",
    {} as BaseCsharpCustomConfigSchema,
    {} as FernGeneratorExec.config.GeneratorConfig
);

describe("TypeLiteral support", () => {
    // Helper function to convert TypeLiteral to string
    const toString = (literal: ast.TypeLiteral): string => {
        return literal.toString({
            namespace: "",
            allNamespaceSegments: new Set<string>(),
            allTypeClassReferences: new Map<string, Set<string>>(),
            generation
        });
    };

    describe("primitive literals", () => {
        it("boolean - true", () => {
            const literal = generation.csharp.TypeLiteral.boolean(true);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("boolean - false", () => {
            const literal = generation.csharp.TypeLiteral.boolean(false);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("integer", () => {
            const literal = generation.csharp.TypeLiteral.integer(42);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("long", () => {
            const literal = generation.csharp.TypeLiteral.long(9007199254740991);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("uint", () => {
            const literal = generation.csharp.TypeLiteral.uint(42);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("ulong", () => {
            const literal = generation.csharp.TypeLiteral.ulong(9007199254740991);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("float", () => {
            const literal = generation.csharp.TypeLiteral.float(3.14);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("double", () => {
            const literal = generation.csharp.TypeLiteral.double(2.718281828);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("decimal", () => {
            const literal = generation.csharp.TypeLiteral.decimal(99.99);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("string", () => {
            const literal = generation.csharp.TypeLiteral.string("hello world");
            expect(toString(literal)).toMatchSnapshot();
        });

        it("string with special characters", () => {
            const literal = generation.csharp.TypeLiteral.string('hello\nworld\t"quotes"');
            expect(toString(literal)).toMatchSnapshot();
        });

        it("null", () => {
            const literal = generation.csharp.TypeLiteral.null();
            expect(toString(literal)).toMatchSnapshot();
        });

        it("nop", () => {
            const literal = generation.csharp.TypeLiteral.nop();
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("date and time literals", () => {
        it("date", () => {
            const literal = generation.csharp.TypeLiteral.date("2023-12-25");
            expect(toString(literal)).toMatchSnapshot();
        });

        it("datetime", () => {
            const literal = generation.csharp.TypeLiteral.datetime("2023-12-25T10:30:00Z");
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("list literals", () => {
        it("empty list", () => {
            const literal = generation.csharp.TypeLiteral.list({
                valueType: generation.csharp.Type.string,
                values: []
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("list with strings", () => {
            const literal = generation.csharp.TypeLiteral.list({
                valueType: generation.csharp.Type.string,
                values: [
                    generation.csharp.TypeLiteral.string("apple"),
                    generation.csharp.TypeLiteral.string("banana"),
                    generation.csharp.TypeLiteral.string("cherry")
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("list with integers", () => {
            const literal = generation.csharp.TypeLiteral.list({
                valueType: generation.csharp.Type.integer,
                values: [
                    generation.csharp.TypeLiteral.integer(1),
                    generation.csharp.TypeLiteral.integer(2),
                    generation.csharp.TypeLiteral.integer(3)
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("list with nop values (filtered)", () => {
            const literal = generation.csharp.TypeLiteral.list({
                valueType: generation.csharp.Type.integer,
                values: [
                    generation.csharp.TypeLiteral.integer(1),
                    generation.csharp.TypeLiteral.nop(),
                    generation.csharp.TypeLiteral.integer(3)
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("nested list", () => {
            const literal = generation.csharp.TypeLiteral.list({
                valueType: generation.csharp.Type.list(generation.csharp.Type.integer),
                values: [
                    generation.csharp.TypeLiteral.list({
                        valueType: generation.csharp.Type.integer,
                        values: [generation.csharp.TypeLiteral.integer(1), generation.csharp.TypeLiteral.integer(2)]
                    }),
                    generation.csharp.TypeLiteral.list({
                        valueType: generation.csharp.Type.integer,
                        values: [generation.csharp.TypeLiteral.integer(3), generation.csharp.TypeLiteral.integer(4)]
                    })
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("set literals", () => {
        it("empty set", () => {
            const literal = generation.csharp.TypeLiteral.set({
                valueType: generation.csharp.Type.string,
                values: []
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("set with strings", () => {
            const literal = generation.csharp.TypeLiteral.set({
                valueType: generation.csharp.Type.string,
                values: [
                    generation.csharp.TypeLiteral.string("red"),
                    generation.csharp.TypeLiteral.string("green"),
                    generation.csharp.TypeLiteral.string("blue")
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("set with integers", () => {
            const literal = generation.csharp.TypeLiteral.set({
                valueType: generation.csharp.Type.integer,
                values: [
                    generation.csharp.TypeLiteral.integer(10),
                    generation.csharp.TypeLiteral.integer(20),
                    generation.csharp.TypeLiteral.integer(30)
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("set with nop values (filtered)", () => {
            const literal = generation.csharp.TypeLiteral.set({
                valueType: generation.csharp.Type.string,
                values: [
                    generation.csharp.TypeLiteral.string("alpha"),
                    generation.csharp.TypeLiteral.nop(),
                    generation.csharp.TypeLiteral.string("beta")
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("dictionary literals", () => {
        it("empty dictionary", () => {
            const literal = generation.csharp.TypeLiteral.dictionary({
                keyType: generation.csharp.Type.string,
                valueType: generation.csharp.Type.integer,
                entries: []
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("dictionary with string keys and integer values", () => {
            const literal = generation.csharp.TypeLiteral.dictionary({
                keyType: generation.csharp.Type.string,
                valueType: generation.csharp.Type.integer,
                entries: [
                    {
                        key: generation.csharp.TypeLiteral.string("one"),
                        value: generation.csharp.TypeLiteral.integer(1)
                    },
                    {
                        key: generation.csharp.TypeLiteral.string("two"),
                        value: generation.csharp.TypeLiteral.integer(2)
                    },
                    {
                        key: generation.csharp.TypeLiteral.string("three"),
                        value: generation.csharp.TypeLiteral.integer(3)
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("dictionary with integer keys and string values", () => {
            const literal = generation.csharp.TypeLiteral.dictionary({
                keyType: generation.csharp.Type.integer,
                valueType: generation.csharp.Type.string,
                entries: [
                    {
                        key: generation.csharp.TypeLiteral.integer(1),
                        value: generation.csharp.TypeLiteral.string("first")
                    },
                    {
                        key: generation.csharp.TypeLiteral.integer(2),
                        value: generation.csharp.TypeLiteral.string("second")
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("dictionary with nop entries (filtered)", () => {
            const literal = generation.csharp.TypeLiteral.dictionary({
                keyType: generation.csharp.Type.string,
                valueType: generation.csharp.Type.string,
                entries: [
                    {
                        key: generation.csharp.TypeLiteral.string("valid"),
                        value: generation.csharp.TypeLiteral.string("entry")
                    },
                    {
                        key: generation.csharp.TypeLiteral.nop(),
                        value: generation.csharp.TypeLiteral.string("skipped")
                    },
                    {
                        key: generation.csharp.TypeLiteral.string("another"),
                        value: generation.csharp.TypeLiteral.nop()
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("nested dictionary", () => {
            const literal = generation.csharp.TypeLiteral.dictionary({
                keyType: generation.csharp.Type.string,
                valueType: generation.csharp.Type.idictionary(
                    generation.csharp.Type.string,
                    generation.csharp.Type.integer
                ),
                entries: [
                    {
                        key: generation.csharp.TypeLiteral.string("group1"),
                        value: generation.csharp.TypeLiteral.dictionary({
                            keyType: generation.csharp.Type.string,
                            valueType: generation.csharp.Type.integer,
                            entries: [
                                {
                                    key: generation.csharp.TypeLiteral.string("a"),
                                    value: generation.csharp.TypeLiteral.integer(1)
                                }
                            ]
                        })
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("class literals", () => {
        it("empty class instantiation", () => {
            const classRef = generation.csharp.classReference({
                name: "Person",
                namespace: "MyApp.Models"
            });
            const literal = generation.csharp.TypeLiteral.class_({
                reference: classRef,
                fields: []
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("class with single field", () => {
            const classRef = generation.csharp.classReference({
                name: "Person",
                namespace: "MyApp.Models"
            });
            const literal = generation.csharp.TypeLiteral.class_({
                reference: classRef,
                fields: [
                    {
                        name: "Name",
                        value: generation.csharp.TypeLiteral.string("John Doe")
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("class with multiple fields", () => {
            const classRef = generation.csharp.classReference({
                name: "Person",
                namespace: "MyApp.Models"
            });
            const literal = generation.csharp.TypeLiteral.class_({
                reference: classRef,
                fields: [
                    {
                        name: "Name",
                        value: generation.csharp.TypeLiteral.string("Jane Smith")
                    },
                    {
                        name: "Age",
                        value: generation.csharp.TypeLiteral.integer(30)
                    },
                    {
                        name: "IsActive",
                        value: generation.csharp.TypeLiteral.boolean(true)
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("class with nop fields (filtered)", () => {
            const classRef = generation.csharp.classReference({
                name: "Person",
                namespace: "MyApp.Models"
            });
            const literal = generation.csharp.TypeLiteral.class_({
                reference: classRef,
                fields: [
                    {
                        name: "Name",
                        value: generation.csharp.TypeLiteral.string("Bob")
                    },
                    {
                        name: "MiddleName",
                        value: generation.csharp.TypeLiteral.nop()
                    },
                    {
                        name: "LastName",
                        value: generation.csharp.TypeLiteral.string("Johnson")
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("class with nested collection field", () => {
            const classRef = generation.csharp.classReference({
                name: "Team",
                namespace: "MyApp.Models"
            });
            const literal = generation.csharp.TypeLiteral.class_({
                reference: classRef,
                fields: [
                    {
                        name: "TeamName",
                        value: generation.csharp.TypeLiteral.string("Engineering")
                    },
                    {
                        name: "Members",
                        value: generation.csharp.TypeLiteral.list({
                            valueType: generation.csharp.Type.string,
                            values: [
                                generation.csharp.TypeLiteral.string("Alice"),
                                generation.csharp.TypeLiteral.string("Bob"),
                                generation.csharp.TypeLiteral.string("Carol")
                            ]
                        })
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("reference literals", () => {
        it("reference to variable", () => {
            const variable = generation.csharp.codeblock("myVariable");
            const literal = generation.csharp.TypeLiteral.reference(variable);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("reference to method invocation", () => {
            const classRef = generation.csharp.classReference({
                name: "MyClass",
                namespace: "MyApp"
            });
            const invocation = generation.csharp.invokeMethod({
                on: classRef,
                method: "GetValue",
                arguments_: []
            });
            const literal = generation.csharp.TypeLiteral.reference(invocation);
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("unknown literals", () => {
        it("unknown - boolean", () => {
            const literal = generation.csharp.TypeLiteral.unknown(true);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - string", () => {
            const literal = generation.csharp.TypeLiteral.unknown("test string");
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - number", () => {
            const literal = generation.csharp.TypeLiteral.unknown(42);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - null", () => {
            const literal = generation.csharp.TypeLiteral.unknown(null);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - empty array", () => {
            const literal = generation.csharp.TypeLiteral.unknown([]);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - array with mixed types", () => {
            const literal = generation.csharp.TypeLiteral.unknown([1, "two", true, null]);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - nested array", () => {
            const literal = generation.csharp.TypeLiteral.unknown([
                [1, 2],
                [3, 4]
            ]);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - empty object", () => {
            const literal = generation.csharp.TypeLiteral.unknown({});
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - object with primitive properties", () => {
            const literal = generation.csharp.TypeLiteral.unknown({
                name: "John",
                age: 30,
                active: true
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - nested object", () => {
            const literal = generation.csharp.TypeLiteral.unknown({
                user: {
                    name: "Alice",
                    settings: {
                        theme: "dark"
                    }
                }
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - object with array property", () => {
            const literal = generation.csharp.TypeLiteral.unknown({
                items: [1, 2, 3],
                count: 3
            });
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("complex combinations", () => {
        it("list of dictionaries", () => {
            const literal = generation.csharp.TypeLiteral.list({
                valueType: generation.csharp.Type.idictionary(
                    generation.csharp.Type.string,
                    generation.csharp.Type.string
                ),
                values: [
                    generation.csharp.TypeLiteral.dictionary({
                        keyType: generation.csharp.Type.string,
                        valueType: generation.csharp.Type.string,
                        entries: [
                            {
                                key: generation.csharp.TypeLiteral.string("key1"),
                                value: generation.csharp.TypeLiteral.string("value1")
                            }
                        ]
                    }),
                    generation.csharp.TypeLiteral.dictionary({
                        keyType: generation.csharp.Type.string,
                        valueType: generation.csharp.Type.string,
                        entries: [
                            {
                                key: generation.csharp.TypeLiteral.string("key2"),
                                value: generation.csharp.TypeLiteral.string("value2")
                            }
                        ]
                    })
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("dictionary with list values", () => {
            const literal = generation.csharp.TypeLiteral.dictionary({
                keyType: generation.csharp.Type.string,
                valueType: generation.csharp.Type.list(generation.csharp.Type.integer),
                entries: [
                    {
                        key: generation.csharp.TypeLiteral.string("evens"),
                        value: generation.csharp.TypeLiteral.list({
                            valueType: generation.csharp.Type.integer,
                            values: [
                                generation.csharp.TypeLiteral.integer(2),
                                generation.csharp.TypeLiteral.integer(4),
                                generation.csharp.TypeLiteral.integer(6)
                            ]
                        })
                    },
                    {
                        key: generation.csharp.TypeLiteral.string("odds"),
                        value: generation.csharp.TypeLiteral.list({
                            valueType: generation.csharp.Type.integer,
                            values: [
                                generation.csharp.TypeLiteral.integer(1),
                                generation.csharp.TypeLiteral.integer(3),
                                generation.csharp.TypeLiteral.integer(5)
                            ]
                        })
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("set of sets", () => {
            const literal = generation.csharp.TypeLiteral.set({
                valueType: generation.csharp.Type.set(generation.csharp.Type.integer),
                values: [
                    generation.csharp.TypeLiteral.set({
                        valueType: generation.csharp.Type.integer,
                        values: [generation.csharp.TypeLiteral.integer(1), generation.csharp.TypeLiteral.integer(2)]
                    }),
                    generation.csharp.TypeLiteral.set({
                        valueType: generation.csharp.Type.integer,
                        values: [generation.csharp.TypeLiteral.integer(3), generation.csharp.TypeLiteral.integer(4)]
                    })
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("class with various typed fields", () => {
            const classRef = generation.csharp.classReference({
                name: "ComplexModel",
                namespace: "MyApp.Models"
            });
            const literal = generation.csharp.TypeLiteral.class_({
                reference: classRef,
                fields: [
                    {
                        name: "StringField",
                        value: generation.csharp.TypeLiteral.string("text")
                    },
                    {
                        name: "IntField",
                        value: generation.csharp.TypeLiteral.integer(100)
                    },
                    {
                        name: "DoubleField",
                        value: generation.csharp.TypeLiteral.double(3.14159)
                    },
                    {
                        name: "BoolField",
                        value: generation.csharp.TypeLiteral.boolean(true)
                    },
                    {
                        name: "DateField",
                        value: generation.csharp.TypeLiteral.date("2024-01-01")
                    },
                    {
                        name: "ListField",
                        value: generation.csharp.TypeLiteral.list({
                            valueType: generation.csharp.Type.string,
                            values: [
                                generation.csharp.TypeLiteral.string("a"),
                                generation.csharp.TypeLiteral.string("b")
                            ]
                        })
                    },
                    {
                        name: "DictField",
                        value: generation.csharp.TypeLiteral.dictionary({
                            keyType: generation.csharp.Type.string,
                            valueType: generation.csharp.Type.integer,
                            entries: [
                                {
                                    key: generation.csharp.TypeLiteral.string("count"),
                                    value: generation.csharp.TypeLiteral.integer(5)
                                }
                            ]
                        })
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });
    });
});
