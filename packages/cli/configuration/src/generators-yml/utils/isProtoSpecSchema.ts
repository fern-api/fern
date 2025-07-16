import { ProtobufSpecSchema, SpecSchema } from "../schemas";

export function isProtoSpecSchema(spec: SpecSchema): spec is ProtobufSpecSchema {
    return (spec as ProtobufSpecSchema)?.proto != null;
}
