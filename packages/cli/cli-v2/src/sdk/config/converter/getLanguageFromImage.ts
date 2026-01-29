import type { Language } from "../Language";
import { DOCKER_IMAGE_TO_LANGUAGE } from "./constants";

/**
 * Returns the language for a given image reference.
 */
export function getLanguageFromImage({ image }: { image: string }): Language | undefined {
    return DOCKER_IMAGE_TO_LANGUAGE[image];
}
