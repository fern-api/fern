import {
    jsonObjectSchema,
    jsonValueSchema,
    type SdkConfigIrV1,
    sdkConfigIrV1Schema,
    serializeSdkConfigIrV1
} from "@postman/sdk-config";

/**
 * Walks a zod schema and a value together, with two conventions shared by the coverage test and the
 * classifier:
 * - a record (free-form keys) is one path segment `*`;
 * - a union contributes the paths of all its members.
 * Array members are `[]` in schema paths and `[i]` in display paths. An array of non-objects is a
 * single leaf. Ported from the hosted bridge (sdk-gen-api `src/build/fern-cli-bridge/mapper/walk.ts`).
 */

interface ZodDef {
    type: string;
    shape?: Record<string, unknown>;
    element?: unknown;
    valueType?: unknown;
    options?: unknown[];
    innerType?: unknown;
    in?: unknown;
    left?: unknown;
    right?: unknown;
    getter?: () => unknown;
}

interface ZodLike {
    _zod: { def: ZodDef };
}

export interface IrLeaf {
    /** Schema form, for example `source.specs[].namespace`. */
    schemaPath: string;
    /** SDK Config form, for example `source.specs[1].namespace`. */
    displayPath: string;
    value: unknown;
}

const WRAPPERS = new Set(["optional", "default", "prefault", "nullable", "nonoptional", "readonly", "catch"]);
const JSON_SCHEMAS = new Set<unknown>([jsonValueSchema, jsonObjectSchema]);

function isZodLike(value: unknown): value is ZodLike {
    if (typeof value !== "object" || value == null || !("_zod" in value)) {
        return false;
    }
    const zod = value._zod;
    return (
        typeof zod === "object" &&
        zod != null &&
        "def" in zod &&
        typeof zod.def === "object" &&
        zod.def != null &&
        "type" in zod.def &&
        typeof zod.def.type === "string"
    );
}

function zodSchemas(value: unknown): ZodLike[] {
    return isZodLike(value) ? [value] : [];
}

/** Returns the non-wrapper schemas a schema stands for, expanding unions and intersections. */
function resolve(schema: ZodLike, seen = new Set<ZodLike>()): ZodLike[] {
    if (JSON_SCHEMAS.has(schema) || seen.has(schema)) {
        return [schema];
    }
    seen.add(schema);
    const def = schema._zod.def;
    const inner = (value: unknown): ZodLike[] => zodSchemas(value).flatMap((child) => resolve(child, seen));
    if (WRAPPERS.has(def.type)) {
        return inner(def.innerType);
    }
    if (def.type === "pipe") {
        return inner(def.in);
    }
    if (def.type === "lazy") {
        return inner(def.getter?.());
    }
    if (def.type === "union") {
        return (def.options ?? []).flatMap(inner);
    }
    if (def.type === "intersection") {
        return [...inner(def.left), ...inner(def.right)];
    }
    return [schema];
}

function kind(schema: ZodLike): "object" | "array" | "record" | "leaf" {
    if (JSON_SCHEMAS.has(schema)) {
        return "leaf";
    }
    const { type } = schema._zod.def;
    return type === "object" || type === "array" || type === "record" ? type : "leaf";
}

function joinPath(base: string, key: string): string {
    return base ? `${base}.${key}` : key;
}

function rootSchema(): ZodLike {
    if (!isZodLike(sdkConfigIrV1Schema)) {
        throw new Error("@postman/sdk-config's sdkConfigIrV1Schema is not a zod schema");
    }
    return sdkConfigIrV1Schema;
}

/** Lists every leaf path of a schema, in schema form. */
export function schemaLeafPaths(schema: ZodLike = rootSchema()): Set<string> {
    const paths = new Set<string>();
    const visit = (current: ZodLike, path: string, stack: Set<ZodLike>): void => {
        for (const member of resolve(current)) {
            if (stack.has(member)) {
                paths.add(path);
                continue;
            }
            const nextStack = new Set(stack).add(member);
            const def = member._zod.def;
            switch (kind(member)) {
                case "object":
                    for (const [key, child] of Object.entries(def.shape ?? {})) {
                        zodSchemas(child).forEach((childSchema) => visit(childSchema, joinPath(path, key), nextStack));
                    }
                    break;
                case "array": {
                    const elements = zodSchemas(def.element);
                    if (elements.flatMap((element) => resolve(element)).some((element) => kind(element) !== "leaf")) {
                        elements.forEach((element) => visit(element, `${path}[]`, nextStack));
                    } else {
                        paths.add(path);
                    }
                    break;
                }
                case "record":
                    zodSchemas(def.valueType).forEach((valueType) => visit(valueType, joinPath(path, "*"), nextStack));
                    break;
                case "leaf":
                    paths.add(path);
                    break;
            }
        }
    };
    visit(schema, "", new Set());
    return paths;
}

/** Lists the leaves of an IR value, guided by the schema. Empty objects carry no setting. */
export function irLeaves(value: unknown, schema: ZodLike = rootSchema()): IrLeaf[] {
    const leaves: IrLeaf[] = [];
    const visit = (current: unknown, schemas: ZodLike[], schemaPath: string, displayPath: string): void => {
        const members = schemas.flatMap((candidate) => resolve(candidate));
        const objects = members.filter((member) => kind(member) === "object");
        const records = members.filter((member) => kind(member) === "record");
        const arrays = members.filter((member) => kind(member) === "array");
        if (Array.isArray(current) && arrays.length > 0) {
            const elements = arrays.flatMap((array) => zodSchemas(array._zod.def.element));
            if (current.some((item) => isRecord(item))) {
                current.forEach((item, index) => visit(item, elements, `${schemaPath}[]`, `${displayPath}[${index}]`));
                return;
            }
        } else if (isRecord(current) && (objects.length > 0 || records.length > 0)) {
            for (const [key, child] of Object.entries(current)) {
                const shaped = objects.flatMap((object) => zodSchemas(object._zod.def.shape?.[key]));
                if (shaped.length > 0) {
                    visit(child, shaped, joinPath(schemaPath, key), joinPath(displayPath, key));
                } else if (records.length > 0) {
                    const valueTypes = records.flatMap((record) => zodSchemas(record._zod.def.valueType));
                    visit(child, valueTypes, joinPath(schemaPath, "*"), joinPath(displayPath, key));
                } else {
                    leaves.push({
                        schemaPath: joinPath(schemaPath, key),
                        displayPath: joinPath(displayPath, key),
                        value: child
                    });
                }
            }
            return;
        }
        leaves.push({ schemaPath, displayPath, value: current });
    };
    visit(value, [schema], "", "");
    return leaves;
}

/** Serializes the IR with versioned defaults omitted, so only fields the user set remain. */
export function nonDefaultLeaves(ir: SdkConfigIrV1): IrLeaf[] {
    const wire: unknown = JSON.parse(new TextDecoder().decode(serializeSdkConfigIrV1(ir).body));
    return irLeaves(wire);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
