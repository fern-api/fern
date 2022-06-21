import { ModelReference } from "@fern-api/api";

export function getNameOfModelReference(reference: ModelReference): string {
    return ModelReference._visit(reference, {
        type: ({ name }) => name,
        error: ({ name }) => name,
        _unknown: () => {
            throw new Error("Unknown model reference: " + reference._type);
        },
    });
}
