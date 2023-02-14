import { TaskContext } from "@fern-api/task-context";
import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertPathItemObject } from "./convertPathItemObject";
import { convertSchema } from "./convertSchema";
import { convertServers } from "./convertServers";
import { IrBuilder } from "./IrBuilder";
import { getSchemaIdFromReference, isReferenceObject } from "./utils";

export function generateIrForOpenAPIV3({
    document,
    taskContext,
}: {
    document: OpenAPIV3.Document;
    taskContext: TaskContext;
}): FernOpenapiIr.IntermediateRepresentation {
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
            taskContext,
        });
    });

    Object.entries(document.components?.schemas ?? {}).forEach(([schemaName, schemaDefinition]) => {
        convertSchemaDefinition({ schemaDefinition, schemaName, irBuilder, taskContext });
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
    taskContext,
}: {
    schemaName: string;
    schemaDefinition: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
    irBuilder: IrBuilder;
    taskContext: TaskContext;
}): void {
    if (isReferenceObject(schemaDefinition)) {
        const schemaId = getSchemaIdFromReference(schemaDefinition);
        if (schemaId == null) {
            taskContext.logger.warn(`Failed to convert ${schemaName} with ref ${schemaDefinition.$ref}`);
            return;
        }
        const referencedSchema = FernOpenapiIr.Schema.reference({
            reference: schemaId,
        });
        irBuilder.addSchema(schemaName, referencedSchema);
    } else {
        const convertedSchema = convertSchema({ schema: schemaDefinition, taskContext });
        if (convertedSchema == null) {
            taskContext.logger.warn(`Failed to convert ${schemaName} ${JSON.stringify(convertedSchema)}`);
            return;
        }
        irBuilder.addSchema(schemaName, convertedSchema);
    }
}
