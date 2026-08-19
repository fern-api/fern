import { bench, describe } from "vitest";
import {
    list,
    object,
    property,
    record,
    string,
    number,
    boolean,
    lazy,
    lazyObject,
    undiscriminatedUnion,
} from "../../../../src/core/schemas/builders";

// ---------------------------------------------------------------------------
// Helpers – build fixture data at various scales
// ---------------------------------------------------------------------------

function makeStringList(n: number): string[] {
    return Array.from({ length: n }, (_, i) => `item-${i}`);
}

function makeObjectList(n: number): Array<{ first_name: string; last_name: string; age: number }> {
    return Array.from({ length: n }, (_, i) => ({
        first_name: `first-${i}`,
        last_name: `last-${i}`,
        age: 20 + (i % 60),
    }));
}

function makeRecord(n: number): Record<string, string> {
    const rec: Record<string, string> = {};
    for (let i = 0; i < n; i++) {
        rec[`key-${i}`] = `value-${i}`;
    }
    return rec;
}

function makeNumericRecord(n: number): Record<string, string> {
    const rec: Record<string, string> = {};
    for (let i = 0; i < n; i++) {
        rec[String(i)] = `value-${i}`;
    }
    return rec;
}

function makeFlatObject(n: number): Record<string, string> {
    const obj: Record<string, string> = {};
    for (let i = 0; i < n; i++) {
        obj[`field_${i}`] = `value-${i}`;
    }
    return obj;
}

function makeNestedIRLike(depth: number, breadth: number): Record<string, unknown> {
    if (depth === 0) {
        return { name: "leaf", value: "data", count: 42 };
    }
    const children: Array<Record<string, unknown>> = [];
    for (let i = 0; i < breadth; i++) {
        children.push(makeNestedIRLike(depth - 1, breadth));
    }
    return { name: `node-d${depth}`, children, metadata: { key: "val" } };
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const stringListSchema = list(string());

const objectListItemSchema = object({
    firstName: property("first_name", string()),
    lastName: property("last_name", string()),
    age: number(),
});
const objectListSchema = list(objectListItemSchema);

const stringRecordSchema = record(string(), string());
const numericKeyRecordSchema = record(number(), string());

// A "wide" object schema with many properties (simulates large IR types)
function buildWideObjectSchema(n: number) {
    const schemaProps: Record<string, ReturnType<typeof property>> = {};
    for (let i = 0; i < n; i++) {
        schemaProps[`field${i}`] = property(`field_${i}`, string());
    }
    return object(schemaProps);
}
const wideObject10 = buildWideObjectSchema(10);
const wideObject50 = buildWideObjectSchema(50);
const wideObject100 = buildWideObjectSchema(100);

// Nested object schema (simulates IR nesting)
const innerSchema = object({
    name: string(),
    value: string(),
    count: number(),
});

const nestedSchema = object({
    name: string(),
    children: list(
        object({
            name: string(),
            children: list(innerSchema),
            metadata: object({ key: string() }),
        }),
    ),
    metadata: object({ key: string() }),
});

// Lazy schema (simulates recursive IR types like recursive unions)
interface TreeNode {
    value: string;
    children: TreeNode[];
}
const treeNodeSchema = lazyObject(() =>
    object({
        value: string(),
        children: list(lazy(() => treeNodeSchema)),
    }),
);

function makeTree(depth: number, breadth: number): { value: string; children: unknown[] } {
    if (depth === 0) {
        return { value: "leaf", children: [] };
    }
    return {
        value: `node-d${depth}`,
        children: Array.from({ length: breadth }, () => makeTree(depth - 1, breadth)),
    };
}

// ---------------------------------------------------------------------------
// Benchmarks – list (parse + json)
// ---------------------------------------------------------------------------

describe("list - parse", () => {
    const list100 = makeStringList(100);
    const list1000 = makeStringList(1_000);
    const list10000 = makeStringList(10_000);

    bench("string list (100 items)", () => {
        stringListSchema.parseOrThrow(list100);
    });

    bench("string list (1,000 items)", () => {
        stringListSchema.parseOrThrow(list1000);
    });

    bench("string list (10,000 items)", () => {
        stringListSchema.parseOrThrow(list10000);
    });

    const objList100 = makeObjectList(100);
    const objList1000 = makeObjectList(1_000);

    bench("object list (100 items)", () => {
        objectListSchema.parseOrThrow(objList100);
    });

    bench("object list (1,000 items)", () => {
        objectListSchema.parseOrThrow(objList1000);
    });
});

describe("list - json", () => {
    const parsed100 = Array.from({ length: 100 }, (_, i) => ({
        firstName: `first-${i}`,
        lastName: `last-${i}`,
        age: 20 + (i % 60),
    }));
    const parsed1000 = Array.from({ length: 1_000 }, (_, i) => ({
        firstName: `first-${i}`,
        lastName: `last-${i}`,
        age: 20 + (i % 60),
    }));

    bench("object list json (100 items)", () => {
        objectListSchema.jsonOrThrow(parsed100);
    });

    bench("object list json (1,000 items)", () => {
        objectListSchema.jsonOrThrow(parsed1000);
    });
});

// ---------------------------------------------------------------------------
// Benchmarks – record (parse + json)
// ---------------------------------------------------------------------------

describe("record - parse", () => {
    const rec100 = makeRecord(100);
    const rec1000 = makeRecord(1_000);
    const rec5000 = makeRecord(5_000);

    bench("string record (100 entries)", () => {
        stringRecordSchema.parseOrThrow(rec100);
    });

    bench("string record (1,000 entries)", () => {
        stringRecordSchema.parseOrThrow(rec1000);
    });

    bench("string record (5,000 entries)", () => {
        stringRecordSchema.parseOrThrow(rec5000);
    });

    const numRec100 = makeNumericRecord(100);
    const numRec1000 = makeNumericRecord(1_000);

    bench("numeric-key record (100 entries)", () => {
        numericKeyRecordSchema.parseOrThrow(numRec100);
    });

    bench("numeric-key record (1,000 entries)", () => {
        numericKeyRecordSchema.parseOrThrow(numRec1000);
    });
});

describe("record - json", () => {
    const rec100 = makeRecord(100);
    const rec1000 = makeRecord(1_000);

    bench("string record json (100 entries)", () => {
        stringRecordSchema.jsonOrThrow(rec100);
    });

    bench("string record json (1,000 entries)", () => {
        stringRecordSchema.jsonOrThrow(rec1000);
    });
});

// ---------------------------------------------------------------------------
// Benchmarks – object (parse + json)
// ---------------------------------------------------------------------------

describe("object - parse", () => {
    const flat10 = makeFlatObject(10);
    const flat50 = makeFlatObject(50);
    const flat100 = makeFlatObject(100);

    bench("wide object (10 properties)", () => {
        wideObject10.parseOrThrow(flat10);
    });

    bench("wide object (50 properties)", () => {
        wideObject50.parseOrThrow(flat50);
    });

    bench("wide object (100 properties)", () => {
        wideObject100.parseOrThrow(flat100);
    });
});

describe("object - json", () => {
    // For json, keys are parsed (camelCase) → raw (snake_case)
    const parsed10: Record<string, string> = {};
    for (let i = 0; i < 10; i++) parsed10[`field${i}`] = `value-${i}`;
    const parsed50: Record<string, string> = {};
    for (let i = 0; i < 50; i++) parsed50[`field${i}`] = `value-${i}`;
    const parsed100: Record<string, string> = {};
    for (let i = 0; i < 100; i++) parsed100[`field${i}`] = `value-${i}`;

    bench("wide object json (10 properties)", () => {
        wideObject10.jsonOrThrow(parsed10);
    });

    bench("wide object json (50 properties)", () => {
        wideObject50.jsonOrThrow(parsed50);
    });

    bench("wide object json (100 properties)", () => {
        wideObject100.jsonOrThrow(parsed100);
    });
});

// ---------------------------------------------------------------------------
// Benchmarks – nested structures (simulates real IR serialization)
// ---------------------------------------------------------------------------

describe("nested IR-like structures", () => {
    const shallow = makeNestedIRLike(2, 5); // 5^2 = 25 leaf nodes
    const medium = makeNestedIRLike(3, 5); // 5^3 = 125 leaf nodes
    const deep = makeNestedIRLike(4, 3); // 3^4 = 81 leaf nodes

    bench("nested parse (depth=2, breadth=5, ~25 leaves)", () => {
        nestedSchema.parseOrThrow(shallow);
    });

    bench("nested parse (depth=3, breadth=5, ~125 leaves)", () => {
        nestedSchema.parseOrThrow(medium);
    });

    bench("nested json (depth=2, breadth=5, ~25 leaves)", () => {
        nestedSchema.jsonOrThrow(shallow);
    });

    bench("nested json (depth=3, breadth=5, ~125 leaves)", () => {
        nestedSchema.jsonOrThrow(medium);
    });
});

// ---------------------------------------------------------------------------
// Benchmarks – lazy/recursive schemas
// ---------------------------------------------------------------------------

describe("lazy recursive schema", () => {
    const tree2 = makeTree(2, 3); // 3^2 = 9 nodes
    const tree3 = makeTree(3, 3); // 3^3 = 27 nodes
    const tree4 = makeTree(4, 3); // 3^4 = 81 nodes

    bench("lazy tree parse (depth=2, breadth=3, ~9 nodes)", () => {
        treeNodeSchema.parseOrThrow(tree2);
    });

    bench("lazy tree parse (depth=3, breadth=3, ~27 nodes)", () => {
        treeNodeSchema.parseOrThrow(tree3);
    });

    bench("lazy tree parse (depth=4, breadth=3, ~81 nodes)", () => {
        treeNodeSchema.parseOrThrow(tree4);
    });

    bench("lazy tree json (depth=2, breadth=3)", () => {
        treeNodeSchema.jsonOrThrow(tree2);
    });

    bench("lazy tree json (depth=3, breadth=3)", () => {
        treeNodeSchema.jsonOrThrow(tree3);
    });

    bench("lazy tree json (depth=4, breadth=3)", () => {
        treeNodeSchema.jsonOrThrow(tree4);
    });
});

// ---------------------------------------------------------------------------
// Benchmarks – object schema construction overhead
// ---------------------------------------------------------------------------

describe("schema construction", () => {
    bench("construct wide object schema (10 props)", () => {
        buildWideObjectSchema(10);
    });

    bench("construct wide object schema (50 props)", () => {
        buildWideObjectSchema(50);
    });

    bench("construct wide object schema (100 props)", () => {
        buildWideObjectSchema(100);
    });
});

// ---------------------------------------------------------------------------
// Benchmarks – repeated parse calls (tests caching effectiveness)
// ---------------------------------------------------------------------------

describe("repeated parse (caching effectiveness)", () => {
    const data = makeFlatObject(50);

    // Build a fresh schema each iteration to test first-call overhead
    bench("first parse on fresh schema (50 props)", () => {
        const schema = buildWideObjectSchema(50);
        schema.parseOrThrow(data);
    });

    // Re-use schema to test cached path
    const cachedSchema = buildWideObjectSchema(50);
    // Warm up the cached schema
    cachedSchema.parseOrThrow(data);

    bench("subsequent parse on cached schema (50 props)", () => {
        cachedSchema.parseOrThrow(data);
    });
});
