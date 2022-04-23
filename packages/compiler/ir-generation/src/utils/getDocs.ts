import { RawSchemas } from "@fern-api/syntax-analysis";

export function getDocs(field: RawSchemas.WithDocsSchema | string): string | undefined {
    if (typeof field === "string") {
        return undefined;
    }
    console.log("Field.docs is a ", typeof field.docs, { docs: field.docs });
    return field.docs;
}
