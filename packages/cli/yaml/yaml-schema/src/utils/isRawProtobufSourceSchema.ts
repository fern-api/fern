import { ProtobufSourceSchema, SourceSchema } from "../schemas";

export function isRawProtobufSourceSchema(rawSourceSchema: SourceSchema): rawSourceSchema is ProtobufSourceSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawSourceSchema as ProtobufSourceSchema).proto != null;
}
