import { FullExample, KeyValuePair, PrimitiveExample } from "@fern-api/openapi-ir";

export function convertToFullExample(value: unknown): FullExample | undefined {
    if (typeof value === "string") {
        return FullExample.primitive(PrimitiveExample.string(value));
    } else if (typeof value === "number") {
        if (Number.isInteger(value)) {
            return FullExample.primitive(PrimitiveExample.int(value));
        }
        return FullExample.primitive(PrimitiveExample.double(value));
    } else if (typeof value === "boolean") {
        return FullExample.primitive(PrimitiveExample.boolean(value));
    } else if (Array.isArray(value)) {
        const examples = value.map((example) => convertToFullExample(example));
        if (examples.length === 0) {
            return undefined;
        }
        return FullExample.array(examples.filter((example) => example != null) as FullExample[]);
    } else if (
        value != null &&
        typeof value === "object" &&
        Object.keys(value).every((key) => typeof key === "string")
    ) {
        const kvs: KeyValuePair[] = [];
        for (const [property, propertyValue] of Object.entries(value)) {
            const propertyExample = convertToFullExample(propertyValue);
            if (propertyExample != null) {
                kvs.push({
                    key: PrimitiveExample.string(property),
                    value: propertyExample
                });
            }
        }
        return FullExample.map(kvs);
    }
    return undefined;
}
