import { Values } from "@fern-api/core-utils";

export const TwilioOpenAPIExtension = {
    /**
     * Object-valued extension used across Twilio's OpenAPI specs, e.g.
     *
     *   x-twilio:
     *     libraryVisibility: public | private | hidden
     *     docsVisibility: public | private | hidden
     *
     * `libraryVisibility` controls whether an element is part of the generated SDK surface.
     */
    TWILIO: "x-twilio"
} as const;

export type TwilioOpenAPIExtension = Values<typeof TwilioOpenAPIExtension>;
