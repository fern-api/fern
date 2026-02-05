import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ast, CsharpConfigSchema } from "../..";
import { Generation } from "../../context/generation-info";

const generation = new Generation(
    {} as unknown as IntermediateRepresentation,
    "",
    {} as CsharpConfigSchema,
    {} as FernGeneratorExec.config.GeneratorConfig
);

describe("Literal support", () => {
    // Helper function to convert Literal to string
    const toString = (literal: ast.Literal): string => {
        return literal.toString({
            namespace: "",
            allNamespaceSegments: new Set<string>(),
            allTypeClassReferences: new Map<string, Set<string>>(),
            generation
        });
    };

    describe("primitive literals", () => {
        it("boolean - true", () => {
            const literal = generation.csharp.Literal.boolean(true);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("boolean - false", () => {
            const literal = generation.csharp.Literal.boolean(false);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("integer", () => {
            const literal = generation.csharp.Literal.integer(42);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("long", () => {
            const literal = generation.csharp.Literal.long(9007199254740991);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("uint", () => {
            const literal = generation.csharp.Literal.uint(42);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("ulong", () => {
            const literal = generation.csharp.Literal.ulong(9007199254740991);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("float", () => {
            const literal = generation.csharp.Literal.float(3.14);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("double", () => {
            const literal = generation.csharp.Literal.double(2.718281828);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("decimal", () => {
            const literal = generation.csharp.Literal.decimal(99.99);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("string", () => {
            const literal = generation.csharp.Literal.string("hello world");
            expect(toString(literal)).toMatchSnapshot();
        });

        it("string with special characters", () => {
            const literal = generation.csharp.Literal.string('hello\nworld\t"quotes"');
            expect(toString(literal)).toMatchSnapshot();
        });

        it("null", () => {
            const literal = generation.csharp.Literal.null();
            expect(toString(literal)).toMatchSnapshot();
        });

        it("nop", () => {
            const literal = generation.csharp.Literal.nop();
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("date and time literals", () => {
        it("date", () => {
            const literal = generation.csharp.Literal.date("2023-12-25");
            expect(toString(literal)).toMatchSnapshot();
        });

        it("datetime", () => {
            const literal = generation.csharp.Literal.datetime("2023-12-25T10:30:00Z");
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("list literals", () => {
        it("empty list", () => {
            const literal = generation.csharp.Literal.list({
                valueType: generation.Primitive.string,
                values: []
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("list with strings", () => {
            const literal = generation.csharp.Literal.list({
                valueType: generation.Primitive.string,
                values: [
                    generation.csharp.Literal.string("apple"),
                    generation.csharp.Literal.string("banana"),
                    generation.csharp.Literal.string("cherry")
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("list with integers", () => {
            const literal = generation.csharp.Literal.list({
                valueType: generation.Primitive.integer,
                values: [
                    generation.csharp.Literal.integer(1),
                    generation.csharp.Literal.integer(2),
                    generation.csharp.Literal.integer(3)
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("list with nop values (filtered)", () => {
            const literal = generation.csharp.Literal.list({
                valueType: generation.Primitive.integer,
                values: [
                    generation.csharp.Literal.integer(1),
                    generation.csharp.Literal.nop(),
                    generation.csharp.Literal.integer(3)
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("nested list", () => {
            const literal = generation.csharp.Literal.list({
                valueType: generation.Collection.list(generation.Primitive.integer),
                values: [
                    generation.csharp.Literal.list({
                        valueType: generation.Primitive.integer,
                        values: [generation.csharp.Literal.integer(1), generation.csharp.Literal.integer(2)]
                    }),
                    generation.csharp.Literal.list({
                        valueType: generation.Primitive.integer,
                        values: [generation.csharp.Literal.integer(3), generation.csharp.Literal.integer(4)]
                    })
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("set literals", () => {
        it("empty set", () => {
            const literal = generation.csharp.Literal.set({
                valueType: generation.Primitive.string,
                values: []
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("set with strings", () => {
            const literal = generation.csharp.Literal.set({
                valueType: generation.Primitive.string,
                values: [
                    generation.csharp.Literal.string("red"),
                    generation.csharp.Literal.string("green"),
                    generation.csharp.Literal.string("blue")
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("set with integers", () => {
            const literal = generation.csharp.Literal.set({
                valueType: generation.Primitive.integer,
                values: [
                    generation.csharp.Literal.integer(10),
                    generation.csharp.Literal.integer(20),
                    generation.csharp.Literal.integer(30)
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("set with nop values (filtered)", () => {
            const literal = generation.csharp.Literal.set({
                valueType: generation.Primitive.string,
                values: [
                    generation.csharp.Literal.string("alpha"),
                    generation.csharp.Literal.nop(),
                    generation.csharp.Literal.string("beta")
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("dictionary literals", () => {
        it("empty dictionary", () => {
            const literal = generation.csharp.Literal.dictionary({
                keyType: generation.Primitive.string,
                valueType: generation.Primitive.integer,
                entries: []
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("dictionary with string keys and integer values", () => {
            const literal = generation.csharp.Literal.dictionary({
                keyType: generation.Primitive.string,
                valueType: generation.Primitive.integer,
                entries: [
                    {
                        key: generation.csharp.Literal.string("one"),
                        value: generation.csharp.Literal.integer(1)
                    },
                    {
                        key: generation.csharp.Literal.string("two"),
                        value: generation.csharp.Literal.integer(2)
                    },
                    {
                        key: generation.csharp.Literal.string("three"),
                        value: generation.csharp.Literal.integer(3)
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("dictionary with integer keys and string values", () => {
            const literal = generation.csharp.Literal.dictionary({
                keyType: generation.Primitive.integer,
                valueType: generation.Primitive.string,
                entries: [
                    {
                        key: generation.csharp.Literal.integer(1),
                        value: generation.csharp.Literal.string("first")
                    },
                    {
                        key: generation.csharp.Literal.integer(2),
                        value: generation.csharp.Literal.string("second")
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("dictionary with nop entries (filtered)", () => {
            const literal = generation.csharp.Literal.dictionary({
                keyType: generation.Primitive.string,
                valueType: generation.Primitive.string,
                entries: [
                    {
                        key: generation.csharp.Literal.string("valid"),
                        value: generation.csharp.Literal.string("entry")
                    },
                    {
                        key: generation.csharp.Literal.nop(),
                        value: generation.csharp.Literal.string("skipped")
                    },
                    {
                        key: generation.csharp.Literal.string("another"),
                        value: generation.csharp.Literal.nop()
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("nested dictionary", () => {
            const literal = generation.csharp.Literal.dictionary({
                keyType: generation.Primitive.string,
                valueType: generation.Collection.idictionary(generation.Primitive.string, generation.Primitive.integer),
                entries: [
                    {
                        key: generation.csharp.Literal.string("group1"),
                        value: generation.csharp.Literal.dictionary({
                            keyType: generation.Primitive.string,
                            valueType: generation.Primitive.integer,
                            entries: [
                                {
                                    key: generation.csharp.Literal.string("a"),
                                    value: generation.csharp.Literal.integer(1)
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
            const literal = generation.csharp.Literal.class_({
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
            const literal = generation.csharp.Literal.class_({
                reference: classRef,
                fields: [
                    {
                        name: "Name",
                        value: generation.csharp.Literal.string("John Doe")
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
            const literal = generation.csharp.Literal.class_({
                reference: classRef,
                fields: [
                    {
                        name: "Name",
                        value: generation.csharp.Literal.string("Jane Smith")
                    },
                    {
                        name: "Age",
                        value: generation.csharp.Literal.integer(30)
                    },
                    {
                        name: "IsActive",
                        value: generation.csharp.Literal.boolean(true)
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
            const literal = generation.csharp.Literal.class_({
                reference: classRef,
                fields: [
                    {
                        name: "Name",
                        value: generation.csharp.Literal.string("Bob")
                    },
                    {
                        name: "MiddleName",
                        value: generation.csharp.Literal.nop()
                    },
                    {
                        name: "LastName",
                        value: generation.csharp.Literal.string("Johnson")
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
            const literal = generation.csharp.Literal.class_({
                reference: classRef,
                fields: [
                    {
                        name: "TeamName",
                        value: generation.csharp.Literal.string("Engineering")
                    },
                    {
                        name: "Members",
                        value: generation.csharp.Literal.list({
                            valueType: generation.Primitive.string,
                            values: [
                                generation.csharp.Literal.string("Alice"),
                                generation.csharp.Literal.string("Bob"),
                                generation.csharp.Literal.string("Carol")
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
            const literal = generation.csharp.Literal.reference(variable);
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
            const literal = generation.csharp.Literal.reference(invocation);
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("unknown literals", () => {
        it("unknown - boolean", () => {
            const literal = generation.csharp.Literal.unknown(true);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - string", () => {
            const literal = generation.csharp.Literal.unknown("test string");
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - number", () => {
            const literal = generation.csharp.Literal.unknown(42);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - null", () => {
            const literal = generation.csharp.Literal.unknown(null);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - empty array", () => {
            const literal = generation.csharp.Literal.unknown([]);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - array with mixed types", () => {
            const literal = generation.csharp.Literal.unknown([1, "two", true, null]);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - nested array", () => {
            const literal = generation.csharp.Literal.unknown([
                [1, 2],
                [3, 4]
            ]);
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - empty object", () => {
            const literal = generation.csharp.Literal.unknown({});
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - object with primitive properties", () => {
            const literal = generation.csharp.Literal.unknown({
                name: "John",
                age: 30,
                active: true
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("unknown - nested object", () => {
            const literal = generation.csharp.Literal.unknown({
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
            const literal = generation.csharp.Literal.unknown({
                items: [1, 2, 3],
                count: 3
            });
            expect(toString(literal)).toMatchSnapshot();
        });
    });

    describe("complex combinations", () => {
        it("list of dictionaries", () => {
            const literal = generation.csharp.Literal.list({
                valueType: generation.Collection.idictionary(generation.Primitive.string, generation.Primitive.string),
                values: [
                    generation.csharp.Literal.dictionary({
                        keyType: generation.Primitive.string,
                        valueType: generation.Primitive.string,
                        entries: [
                            {
                                key: generation.csharp.Literal.string("key1"),
                                value: generation.csharp.Literal.string("value1")
                            }
                        ]
                    }),
                    generation.csharp.Literal.dictionary({
                        keyType: generation.Primitive.string,
                        valueType: generation.Primitive.string,
                        entries: [
                            {
                                key: generation.csharp.Literal.string("key2"),
                                value: generation.csharp.Literal.string("value2")
                            }
                        ]
                    })
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("dictionary with list values", () => {
            const literal = generation.csharp.Literal.dictionary({
                keyType: generation.Primitive.string,
                valueType: generation.Collection.list(generation.Primitive.integer),
                entries: [
                    {
                        key: generation.csharp.Literal.string("evens"),
                        value: generation.csharp.Literal.list({
                            valueType: generation.Primitive.integer,
                            values: [
                                generation.csharp.Literal.integer(2),
                                generation.csharp.Literal.integer(4),
                                generation.csharp.Literal.integer(6)
                            ]
                        })
                    },
                    {
                        key: generation.csharp.Literal.string("odds"),
                        value: generation.csharp.Literal.list({
                            valueType: generation.Primitive.integer,
                            values: [
                                generation.csharp.Literal.integer(1),
                                generation.csharp.Literal.integer(3),
                                generation.csharp.Literal.integer(5)
                            ]
                        })
                    }
                ]
            });
            expect(toString(literal)).toMatchSnapshot();
        });

        it("set of sets", () => {
            const literal = generation.csharp.Literal.set({
                valueType: generation.Collection.set(generation.Primitive.integer),
                values: [
                    generation.csharp.Literal.set({
                        valueType: generation.Primitive.integer,
                        values: [generation.csharp.Literal.integer(1), generation.csharp.Literal.integer(2)]
                    }),
                    generation.csharp.Literal.set({
                        valueType: generation.Primitive.integer,
                        values: [generation.csharp.Literal.integer(3), generation.csharp.Literal.integer(4)]
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
            const literal = generation.csharp.Literal.class_({
                reference: classRef,
                fields: [
                    {
                        name: "StringField",
                        value: generation.csharp.Literal.string("text")
                    },
                    {
                        name: "IntField",
                        value: generation.csharp.Literal.integer(100)
                    },
                    {
                        name: "DoubleField",
                        value: generation.csharp.Literal.double(3.14159)
                    },
                    {
                        name: "BoolField",
                        value: generation.csharp.Literal.boolean(true)
                    },
                    {
                        name: "DateField",
                        value: generation.csharp.Literal.date("2024-01-01")
                    },
                    {
                        name: "ListField",
                        value: generation.csharp.Literal.list({
                            valueType: generation.Primitive.string,
                            values: [generation.csharp.Literal.string("a"), generation.csharp.Literal.string("b")]
                        })
                    },
                    {
                        name: "DictField",
                        value: generation.csharp.Literal.dictionary({
                            keyType: generation.Primitive.string,
                            valueType: generation.Primitive.integer,
                            entries: [
                                {
                                    key: generation.csharp.Literal.string("count"),
                                    value: generation.csharp.Literal.integer(5)
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
