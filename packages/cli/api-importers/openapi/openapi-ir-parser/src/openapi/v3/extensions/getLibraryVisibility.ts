import { assertNever } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";

import { getExtension } from "../../../getExtension.js";
import { ParseOpenAPIOptions } from "../../../options.js";
import { TwilioOpenAPIExtension } from "./twilioExtensions.js";

export const LibraryVisibility = {
    Public: "public",
    Private: "private",
    Hidden: "hidden"
} as const;

export type LibraryVisibility = (typeof LibraryVisibility)[keyof typeof LibraryVisibility];

const LIBRARY_VISIBILITY_VALUES: readonly string[] = Object.values(LibraryVisibility);

interface TwilioExtensionValue {
    libraryVisibility?: unknown;
}

function isLibraryVisibility(value: unknown): value is LibraryVisibility {
    return typeof value === "string" && LIBRARY_VISIBILITY_VALUES.includes(value);
}

/**
 * Reads `x-twilio.libraryVisibility` from an OpenAPI object (info, path item, operation,
 * parameter, schema or property). Returns undefined when the extension is absent or malformed.
 */
export function getLibraryVisibility({
    object,
    logger,
    breadcrumbs
}: {
    object: object;
    logger: Logger;
    breadcrumbs: string[];
}): LibraryVisibility | undefined {
    const twilio = getExtension<TwilioExtensionValue>(object, TwilioOpenAPIExtension.TWILIO);
    const value = twilio?.libraryVisibility;
    if (value == null) {
        return undefined;
    }
    if (!isLibraryVisibility(value)) {
        logger.warn(
            `${breadcrumbs.join(".")} has an unrecognized ${TwilioOpenAPIExtension.TWILIO}.libraryVisibility value "${String(value)}"; expected one of ${LIBRARY_VISIBILITY_VALUES.join(", ")}. Treating as public.`
        );
        return undefined;
    }
    return value;
}

/**
 * Resolves the effective visibility of an element by walking from the most specific
 * object to the least specific one (e.g. operation -> path item -> info) and taking the
 * first explicit value. Elements without any value are public.
 */
export function resolveLibraryVisibility({
    objects,
    logger,
    breadcrumbs
}: {
    objects: (object | undefined)[];
    logger: Logger;
    breadcrumbs: string[];
}): LibraryVisibility {
    for (const object of objects) {
        if (object == null) {
            continue;
        }
        const visibility = getLibraryVisibility({ object, logger, breadcrumbs });
        if (visibility != null) {
            return visibility;
        }
    }
    return LibraryVisibility.Public;
}

export function shouldSkipForLibraryVisibility({
    visibility,
    options
}: {
    visibility: LibraryVisibility;
    options: Pick<ParseOpenAPIOptions, "libraryVisibility">;
}): boolean {
    switch (options.libraryVisibility) {
        case "all":
            return false;
        case "public":
            return visibility !== LibraryVisibility.Public;
        case "private":
            return visibility === LibraryVisibility.Hidden;
        default:
            assertNever(options.libraryVisibility);
    }
}

/**
 * Returns the resolved visibility when the element must be excluded from the IR under the
 * configured `libraryVisibility` filter, or undefined when it should be kept.
 */
export function getSkippedLibraryVisibility({
    objects,
    logger,
    options,
    breadcrumbs
}: {
    objects: (object | undefined)[];
    logger: Logger;
    options: Pick<ParseOpenAPIOptions, "libraryVisibility">;
    breadcrumbs: string[];
}): LibraryVisibility | undefined {
    if (options.libraryVisibility === "all") {
        return undefined;
    }
    const visibility = resolveLibraryVisibility({ objects, logger, breadcrumbs });
    return shouldSkipForLibraryVisibility({ visibility, options }) ? visibility : undefined;
}
