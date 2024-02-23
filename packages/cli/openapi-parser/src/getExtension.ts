import { OpenAPIExtension } from "./openapi/v3/extensions/extensions";
import { FernOpenAPIExtension } from "./openapi/v3/extensions/fernExtensions";
import { ReadmeOpenAPIExtension } from "./openapi/v3/extensions/readmeExtensions";

export function getExtension<T>(
    object: object,
    extension:
        | FernOpenAPIExtension
        | FernOpenAPIExtension[]
        | OpenAPIExtension
        | OpenAPIExtension[]
        | ReadmeOpenAPIExtension
): T | undefined {
    const extensions = Array.isArray(extension) ? extension : [extension];
    for (const extension of extensions) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extensionValue = (object as any)[extension];
        if (extensionValue != null) {
            return extensionValue as T;
        }
    }
    return undefined;
}
