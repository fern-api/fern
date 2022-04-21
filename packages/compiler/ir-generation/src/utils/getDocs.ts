import { RawSchemas } from "@fern-api/syntax-analysis";

export function getDocs(field: RawSchemas.WithDocsSchema | string): string | undefined {
    if (typeof field === "string") {
        return undefined;
    }
    return field.docs;
}
