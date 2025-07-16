import { ProtobufSourceSchema, SourceSchema } from "../schemas";

export function isRawProtobufSourceSchema(
    rawSourceSchema: SourceSchema | null | undefined
): rawSourceSchema is ProtobufSourceSchema {
    if (!rawSourceSchema) {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawSourceSchema as ProtobufSourceSchema).proto != null;
}
