import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertPathItemObject } from "./convertPathItemObject";
import { convertSchema } from "./convertSchema";
import { convertServers } from "./convertServers";
import { IrBuilder } from "./IrBuilder";
import { getSchemaIdFromReference, isReferenceObject } from "./utils";

export function generateIrForOpenAPI(document: OpenAPIV3.Document): FernOpenapiIr.IntermediateRepresentation {
    const irBuilder = new IrBuilder();

    Object.entries(document.paths).forEach(([path, pathItemObject]) => {
        if (pathItemObject == null) {
            return;
        }
        convertPathItemObject({
            path,
            document,
            pathItemObject,
            irBuilder,
        });
    });

    Object.entries(document.components?.schemas ?? {}).forEach(([schemaName, schemaDefinition]) => {
        convertSchemaDefinition({ schemaDefinition, schemaName, irBuilder });
    });

    convertServers(document.servers ?? []).forEach((server) => {
        irBuilder.addServer(server);
    });

    return irBuilder.build();
}

function convertSchemaDefinition({
    schemaName,
    schemaDefinition,
    irBuilder,
}: {
    schemaName: string;
    schemaDefinition: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
    irBuilder: IrBuilder;
}): void {
    if (isReferenceObject(schemaDefinition)) {
        const schemaId = getSchemaIdFromReference(schemaDefinition);
        if (schemaId == null) {
            // TODO(dsinghvi): add log about not being able to parse referenced schema
            return;
        }
        const referencedSchema = FernOpenapiIr.Schema.reference({
            reference: schemaId,
        });
        irBuilder.addSchema(schemaName, referencedSchema);
    } else {
        const convertedSchema = convertSchema({ schema: schemaDefinition });
        if (convertedSchema == null) {
            // TODO(dsinghvi): add log about not being able to convert schema
            return;
        }
        irBuilder.addSchema(schemaName, convertedSchema);
    }
}
