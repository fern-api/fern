import { HttpEndpoint, HttpService } from "@fern-api/api";
import { getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { GeneratedHttpEndpointTypes } from "@fern-typescript/service-types";
import { Directory, SourceFile, StatementStructures, WriterFunction } from "ts-morph";
import { generateConstructQueryParams } from "./generateConstructQueryParams";
import { generateFetcherCall } from "./generateFetcherCall";
import { generateReturnResponse } from "./generateReturnResponse";

export async function generateEndpointMethodBody({
    endpoint,
    endpointTypes,
    serviceFile,
    serviceDefinition,
    typeResolver,
    helperManager,
    modelDirectory,
    encodersDirectory,
}: {
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedHttpEndpointTypes;
    serviceFile: SourceFile;
    serviceDefinition: HttpService;
    typeResolver: TypeResolver;
    helperManager: HelperManager;
    modelDirectory: Directory;
    encodersDirectory: Directory;
}): Promise<(StatementStructures | WriterFunction | string)[]> {
    const queryParameterStatements = generateConstructQueryParams({ endpoint, typeResolver });

    return [
        (writer) => {
            if (queryParameterStatements.length === 0) {
                return;
            }
            for (const statement of queryParameterStatements) {
                writer.writeLine(getTextOfTsNode(statement));
            }
            writer.newLine();
        },
        await generateFetcherCall({
            endpoint,
            endpointTypes,
            serviceFile,
            serviceDefinition,
            includeQueryParams: queryParameterStatements.length > 0,
            helperManager,
            encodersDirectory,
        }),
        (writer) => {
            writer.newLine();
        },
        getTextOfTsNode(
            await generateReturnResponse({
                endpointTypes,
                serviceFile,
                modelDirectory,
                serviceDefinition,
                endpoint,
                helperManager,
                encodersDirectory,
            })
        ),
    ];
}
