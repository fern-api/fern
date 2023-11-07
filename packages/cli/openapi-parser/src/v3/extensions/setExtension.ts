import { OpenAPIExtension } from "./extensions";
import { FernOpenAPIExtension } from "./fernExtensions";

export function setExtension(
    object: object,
    extension: FernOpenAPIExtension | OpenAPIExtension,
    value: unknown
): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (object as any)[extension] = value;
    return object;
}
