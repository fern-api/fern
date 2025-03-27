import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

import { TypeReference } from "@fern-api/ir-sdk";
import { AbstractConverterContext } from "@fern-api/v2-importer-commons";

import { AsyncAPIV2 } from "./2.x";
import { AsyncAPIV3 } from "./3.0";

/**
 * Context class for converting OpenAPI 3.1 specifications
 */
export class AsyncAPIConverterContext extends AbstractConverterContext<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3> {
    
    public isReferenceObject(
        parameter: unknown
    ): parameter is OpenAPIV3.ReferenceObject | OpenAPIV3_1.ReferenceObject {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return parameter != null && "$ref" in (parameter as any);
    }

    public isMessageWithPayload(msg: unknown): msg is AsyncAPIV3.ChannelMessage {
        return msg != null && typeof msg === "object" && "payload" in msg;
    }

    public getTypeIdFromMessageReference(reference: OpenAPIV3_1.ReferenceObject): string | undefined {
        const messageMatch = reference.$ref.match(/\/messages\/(.+)$/);
        if (!messageMatch || !messageMatch[1]) {
            return undefined;
        }
        return messageMatch[1];
    }

    public async convertReferenceToTypeReference(
        reference: OpenAPIV3_1.ReferenceObject
    ): Promise<{ ok: true; reference: TypeReference } | { ok: false }> {
        let typeId: string | undefined;

        const schemaMatch = reference.$ref.match(/^.*\/schemas\/(.+)$/);
        const messageMatch = reference.$ref.match(/^.*\/messages\/(.+)$/);

        if (schemaMatch && schemaMatch[1]) {
            typeId = schemaMatch[1];
        } else if (messageMatch && messageMatch[1]) {
            typeId = messageMatch[1];
        }

        if (typeId == null) {
            return { ok: false };
        }
        const resolvedReference = await this.resolveReference<OpenAPIV3_1.SchemaObject>(reference);
        if (!resolvedReference.resolved) {
            return { ok: false };
        }
        return {
            ok: true,
            reference: TypeReference.named({
                fernFilepath: this.createFernFilepath(),
                name: this.casingsGenerator.generateName(typeId),
                typeId,
                default: undefined,
                inline: false
            })
        };
    }
}
