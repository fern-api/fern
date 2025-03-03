import { ExampleContainer, ExamplePrimitive, ExampleTypeReference, ExampleTypeReferenceShape } from "@fern-api/ir-sdk";

/**
 * Converts an unknown value into an ExampleTypeReference
 */
export function convertToExampleTypeReference(value: unknown): ExampleTypeReference {
    const shape = convertToExampleTypeReferenceShape(value);
    return {
        shape,
        jsonExample: value
    };
}

function convertToExampleTypeReferenceShape(value: unknown): ExampleTypeReferenceShape {
    if (typeof value === "string") {
        return ExampleTypeReferenceShape.primitive(
            ExamplePrimitive.string({
                original: value
            })
        );
    }
    if (typeof value === "number") {
        return ExampleTypeReferenceShape.primitive(ExamplePrimitive.double(value));
    }
    if (typeof value === "boolean") {
        return ExampleTypeReferenceShape.primitive(ExamplePrimitive.boolean(value));
    }
    if (Array.isArray(value)) {
        return ExampleTypeReferenceShape.container(ExampleContainer.list({
            list: value.map((item) => convertToExampleTypeReference(item)),
            itemType: undefined as any,
        }));
    }
    if (value != null && typeof value === "object") {
        return ExampleTypeReferenceShape.container(ExampleContainer.map({
            keyType: undefined as any,
            valueType: undefined as any,
            map: Object.entries(value).map(([key, value]) => ({
                key: convertToExampleTypeReference(key),
                value: convertToExampleTypeReference(value)
            }))
        }));
    }
    return ExampleTypeReferenceShape.unknown(value);
}
