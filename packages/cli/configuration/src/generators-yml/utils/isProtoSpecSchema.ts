import { ProtobufSpecSchema, SpecSchema } from "../schemas/index.js";

export function isProtoSpecSchema(spec: SpecSchema): spec is ProtobufSpecSchema {
    return (spec as ProtobufSpecSchema)?.proto != null;
}
