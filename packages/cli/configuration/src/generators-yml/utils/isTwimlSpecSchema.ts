import { SpecSchema, TwimlSpecSchema } from "../schemas/index.js";

export function isTwimlSpecSchema(spec: SpecSchema): spec is TwimlSpecSchema {
    return (spec as TwimlSpecSchema)?.twiml != null;
}
