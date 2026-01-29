import type { DockerImageReference } from "../DockerImageReference";
import { Language } from "../Language";
import { LANGUAGE_TO_DOCKER_IMAGE } from "./constants";

/**
 * Returns the image reference for a given SDK language and version.
 * If no version is specified, uses "latest".
 */
export function getImageReferenceFromLanguage({
    lang,
    version
}: {
    lang: Language;
    version?: string;
}): DockerImageReference {
    const image = LANGUAGE_TO_DOCKER_IMAGE[lang];
    const tag = version ?? "latest";
    return {
        image,
        tag
    };
}
