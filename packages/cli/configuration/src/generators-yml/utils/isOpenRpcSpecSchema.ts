import { OpenRpcSpecSchema, SpecSchema } from "../schemas"

export function isOpenRpcSpecSchema(spec: SpecSchema): spec is OpenRpcSpecSchema {
    return (spec as OpenRpcSpecSchema)?.openrpc != null
}
