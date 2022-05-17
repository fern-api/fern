import { HttpEndpoint, HttpService } from "@fern-api/api";
import { getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { Directory, SourceFile, StatementStructures, ts, WriterFunction } from "ts-morph";
import { GeneratedEndpointTypes } from "../generate-endpoint-types/types";
import { generateConstructQueryParams } from "./generateConstructQueryParams";
import { generateFetcherCall } from "./generateFetcherCall";
import { generateReturnResponse } from "./generateReturnResponse";

export async function generateEndpointMethodBody({
    endpoint,
    endpointTypes,
    serviceFile,
    serviceDefinition,
    getReferenceToEndpointType,
    typeResolver,
    helperManager,
    modelDirectory,
}: {
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedEndpointTypes;
    serviceFile: SourceFile;
    serviceDefinition: HttpService;
    getReferenceToEndpointType: (identifier: ts.Identifier) => ts.TypeReferenceNode;
    typeResolver: TypeResolver;
    helperManager: HelperManager;
    modelDirectory: Directory;
}): Promise<(StatementStructures | WriterFunction | string)[]> {
    const queryParameterStatements = generateConstructQueryParams({ endpoint, typeResolver });

    return [
        (writer) => {
            for (const statement of queryParameterStatements) {
                writer.writeLine(getTextOfTsNode(statement));
            }
            if (queryParameterStatements.length > 0) {
                writer.newLine();
            }
        },
        await generateFetcherCall({
            endpoint,
            endpointTypes,
            serviceFile,
            serviceDefinition,
            includeQueryParams: queryParameterStatements.length > 0,
            helperManager,
        }),
        (writer) => {
            writer.newLine();
        },
        getTextOfTsNode(
            await generateReturnResponse({
                endpointTypes,
                getReferenceToEndpointType,
                serviceFile,
                modelDirectory,
                serviceDefinition,
                endpoint,
                helperManager,
            })
        ),
    ];
}
