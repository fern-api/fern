import { OpenAPIExtension } from "./extensions";
import { FernOpenAPIExtension } from "./fernExtensions";

export function getExtension<T>(
    object: object,
    extension: FernOpenAPIExtension | FernOpenAPIExtension[] | OpenAPIExtension | OpenAPIExtension[]
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
