import { OpenAPIExtension } from "./openapi/v3/extensions/extensions";
import { FernOpenAPIExtension } from "./openapi/v3/extensions/fernExtensions";
import { TypedExtensionId } from "./openapi/v3/extensions/id";
import { ReadmeOpenAPIExtension } from "./openapi/v3/extensions/readmeExtensions";

/**
 * Get an extension from an object. If the extension is an array, the first
 * extension that is found will be returned.
 *
 * @param object The object to get the extension from.
 * @param extension The extension to get.
 */
export function getExtension<T>(
    object: object,
    extension:
        | FernOpenAPIExtension
        | FernOpenAPIExtension[]
        | OpenAPIExtension
        | OpenAPIExtension[]
        | ReadmeOpenAPIExtension
        | TypedExtensionId<T>
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
