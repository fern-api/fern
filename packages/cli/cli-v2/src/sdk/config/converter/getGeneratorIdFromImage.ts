import { DOCKER_IMAGE_TO_GENERATOR_ID } from "./constants.js";

/**
 * Resolves a Docker image name to the generator ID used by the Fern registry.
 *
 * Looks up the image in the known mapping first. For unknown images, strips
 * the `fernenterprise/` prefix and `fern-` prefix as a fallback.
 */
export function getGeneratorIdFromImage({ image }: { image: string }): string {
    const known = DOCKER_IMAGE_TO_GENERATOR_ID[image];
    if (known != null) {
        return known;
    }

    let name = image;
    if (name.startsWith("fernenterprise/")) {
        name = name.replace("fernenterprise/", "");
    }
    if (name.startsWith("fern-")) {
        name = name.replace("fern-", "");
    }
    return name;
}
