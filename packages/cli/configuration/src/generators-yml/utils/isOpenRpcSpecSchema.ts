import { OpenRpcSpecSchema, SpecSchema } from "../schemas/index.js";

export function isOpenRpcSpecSchema(spec: SpecSchema): spec is OpenRpcSpecSchema {
    return (spec as OpenRpcSpecSchema)?.openrpc != null;
}
