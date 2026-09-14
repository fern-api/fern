import { TypeReference } from "@fern-api/ir-sdk";
import { AbstractConverterContext } from "@fern-api/v3-importer-commons";
import { OpenAPIV3_1 } from "openapi-types";
import { TwimlDocument } from "./loadTwimlDocument.js";

/**
 * TwiML definitions have no JSON-schema `$ref`s, so reference resolution is never reachable; the
 * context exists to reuse the shared casings generator, error collector and logger.
 */
export class TwimlConverterContext extends AbstractConverterContext<TwimlDocument> {
    public convertReferenceToTypeReference(_args: {
        reference: OpenAPIV3_1.ReferenceObject;
        breadcrumbs?: string[];
    }): { ok: true; reference: TypeReference } | { ok: false } {
        return { ok: false };
    }
}
