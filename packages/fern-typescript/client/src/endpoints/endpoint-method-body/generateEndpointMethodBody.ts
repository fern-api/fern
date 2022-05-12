import { HttpEndpoint } from "@fern-api/api";
import { getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { SourceFile, StatementStructures, ts, WriterFunction } from "ts-morph";
import { GeneratedEndpointTypes } from "../generate-endpoint-types/types";
import { generateConstructQueryParams } from "./generateConstructQueryParams";
import { generateFetcherCall } from "./generateFetcherCall";
import { generateReturnResponse } from "./generateReturnResponse";

export async function generateEndpointMethodBody({
    endpoint,
    endpointTypes,
    serviceFile,
    getReferenceToEndpointType,
    typeResolver,
    helperManager,
}: {
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedEndpointTypes;
    serviceFile: SourceFile;
    getReferenceToEndpointType: (identifier: ts.Identifier) => ts.TypeReferenceNode;
    typeResolver: TypeResolver;
    helperManager: HelperManager;
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
        ...(await generateFetcherCall({
            endpoint,
            endpointTypes,
            serviceFile,
            includeQueryParams: queryParameterStatements.length > 0,
            helperManager,
        })),
        (writer) => {
            writer.newLine();
        },
        getTextOfTsNode(generateReturnResponse({ endpointTypes, getReferenceToEndpointType, serviceFile })),
    ];
}
