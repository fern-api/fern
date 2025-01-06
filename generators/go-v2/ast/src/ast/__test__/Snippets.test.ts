import { GoTypeReference } from "../GoTypeReference";
import { Type } from "../Type";
import { TypeInstantiation } from "../TypeInstantiation";
import { AstNode } from "../core/AstNode";
import { GoFile } from "../core/GoFile";

interface TestCase {
    description: string;
    giveNode: AstNode;
}

describe("Snippets", () => {
    const testCases: TestCase[] = [
        {
            description: "any (null)",
            giveNode: TypeInstantiation.any(null)
        },
        {
            description: "any (simple)",
            giveNode: TypeInstantiation.any("Hello, world!")
        },
        {
            description: "any (JSON string)",
            giveNode: TypeInstantiation.any('{"one": 1, "two": 2}')
        },
        {
            description: "any (nested)",
            giveNode: TypeInstantiation.any({
                user: {
                    name: "John Doe",
                    age: 42,
                    active: false
                }
            })
        },
        {
            description: "any (list)",
            giveNode: TypeInstantiation.any({
                organization: "acme",
                users: [
                    {
                        name: "John Doe",
                        age: 42,
                        active: false
                    },
                    {
                        name: "Jane Doe",
                        age: 41,
                        active: true
                    }
                ]
            })
        },
        {
            description: "primitive (int)",
            giveNode: TypeInstantiation.int(42)
        },
        {
            description: "primitive (float)",
            giveNode: TypeInstantiation.float64(42.1)
        },
        {
            description: "primitive (bytes)",
            giveNode: TypeInstantiation.bytes("去是伟大的!")
        },
        {
            description: "slice",
            giveNode: TypeInstantiation.slice({
                valueType: Type.int(),
                values: [TypeInstantiation.int(1), TypeInstantiation.int(2), TypeInstantiation.int(3)]
            })
        },
        {
            description: "slice (w/ nop)",
            giveNode: TypeInstantiation.slice({
                valueType: Type.int(),
                values: [
                    TypeInstantiation.int(1),
                    TypeInstantiation.nop(),
                    TypeInstantiation.int(2),
                    TypeInstantiation.nop()
                ]
            })
        },
        {
            description: "map (empty)",
            giveNode: TypeInstantiation.map({
                keyType: Type.string(),
                valueType: Type.int(),
                entries: []
            })
        },
        {
            description: "map (primitives)",
            giveNode: TypeInstantiation.map({
                keyType: Type.string(),
                valueType: Type.int(),
                entries: [
                    {
                        key: TypeInstantiation.string("one"),
                        value: TypeInstantiation.int(1)
                    },
                    {
                        key: TypeInstantiation.string("two"),
                        value: TypeInstantiation.int(2)
                    }
                ]
            })
        },
        {
            description: "map (w/ nop)",
            giveNode: TypeInstantiation.map({
                keyType: Type.string(),
                valueType: Type.int(),
                entries: [
                    {
                        key: TypeInstantiation.string("one"),
                        value: TypeInstantiation.int(1)
                    },
                    {
                        key: TypeInstantiation.string("two"),
                        value: TypeInstantiation.nop()
                    },
                    {
                        key: TypeInstantiation.nop(),
                        value: TypeInstantiation.int(3)
                    }
                ]
            })
        },
        {
            description: "map (nested)",
            giveNode: TypeInstantiation.map({
                keyType: Type.string(),
                valueType: Type.reference(USER_TYPE_REFERENCE),
                entries: [
                    {
                        key: TypeInstantiation.string("john"),
                        value: TypeInstantiation.struct({
                            typeReference: USER_TYPE_REFERENCE,
                            fields: [
                                {
                                    name: "Name",
                                    value: TypeInstantiation.string("John Doe")
                                }
                            ]
                        })
                    },
                    {
                        key: TypeInstantiation.string("jane"),
                        value: TypeInstantiation.struct({
                            typeReference: USER_TYPE_REFERENCE,
                            fields: [
                                {
                                    name: "Name",
                                    value: TypeInstantiation.string("Jane Doe")
                                }
                            ]
                        })
                    }
                ]
            })
        },
        {
            description: "enum (optional)",
            giveNode: TypeInstantiation.optional(
                TypeInstantiation.enum(
                    new GoTypeReference({
                        name: "StatusDeactivated",
                        importPath: "github.com/acme/acme-go"
                    })
                )
            )
        },
        {
            description: "enum (required)",
            giveNode: TypeInstantiation.enum(
                new GoTypeReference({
                    name: "StatusActivated",
                    importPath: "github.com/acme/acme-go"
                })
            )
        },
        {
            description: "struct (empty)",
            giveNode: TypeInstantiation.struct({
                typeReference: USER_TYPE_REFERENCE,
                fields: []
            })
        },
        {
            description: "struct (primitives)",
            giveNode: TypeInstantiation.struct({
                typeReference: USER_TYPE_REFERENCE,
                fields: [
                    {
                        name: "Name",
                        value: TypeInstantiation.string("John Doe")
                    },
                    {
                        name: "Age",
                        value: TypeInstantiation.int(42)
                    },
                    {
                        name: "Active",
                        value: TypeInstantiation.optional(TypeInstantiation.bool(true))
                    }
                ]
            })
        },
        {
            description: "struct (w/ nop)",
            giveNode: TypeInstantiation.struct({
                typeReference: USER_TYPE_REFERENCE,
                fields: [
                    {
                        name: "Name",
                        value: TypeInstantiation.string("John Doe")
                    },
                    {
                        name: "Age",
                        value: TypeInstantiation.int(42)
                    },
                    {
                        name: "Literal",
                        value: TypeInstantiation.nop()
                    }
                ]
            })
        },
        {
            description: "struct (nested)",
            giveNode: TypeInstantiation.struct({
                typeReference: USER_TYPE_REFERENCE,
                fields: [
                    {
                        name: "Name",
                        value: TypeInstantiation.string("John Doe")
                    },
                    {
                        name: "Address",
                        value: TypeInstantiation.struct({
                            typeReference: new GoTypeReference({
                                name: "Address",
                                importPath: "github.com/acme/acme-go/billing"
                            }),
                            fields: [
                                {
                                    name: "ID",
                                    value: TypeInstantiation.uuid("123e4567-e89b-12d3-a456-426614174000")
                                },
                                {
                                    name: "Street",
                                    value: TypeInstantiation.string("123 Main St.")
                                },
                                {
                                    name: "CreatedAt",
                                    value: TypeInstantiation.optional(
                                        TypeInstantiation.dateTime("1994-01-01T00:00:00Z")
                                    )
                                }
                            ]
                        })
                    }
                ]
            })
        }
    ];
    test.each(testCases)("$description", async ({ giveNode }) => {
        const file = new GoFile({
            packageName: "example",
            rootImportPath: "github.com/acme/acme-go",
            importPath: "github.com/acme/consumer",
            customConfig: {}
        });
        file.write("var value = ");
        file.writeNode(giveNode);

        const content = await file.toString();
        expect(content).toMatchSnapshot();
    });
});

const USER_TYPE_REFERENCE = new GoTypeReference({
    name: "User",
    importPath: "github.com/acme/acme-go"
});
