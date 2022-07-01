import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { DependencyManager, getTextOfTsNode } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { SourceFile, StatementStructures, WriterFunction } from "ts-morph";
import { generateConstructQueryParams } from "./generateConstructQueryParams";
import { generateFetcherCall } from "./generateFetcherCall";
import { generateReturnResponse } from "./generateReturnResponse";

export async function generateEndpointMethodBody({
    endpoint,
    endpointTypes,
    serviceFile,
    serviceDefinition,
    helperManager,
    modelContext,
    dependencyManager,
}: {
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedHttpEndpointTypes;
    serviceFile: SourceFile;
    serviceDefinition: HttpService;
    helperManager: HelperManager;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
}): Promise<(StatementStructures | WriterFunction | string)[]> {
    const queryParameterStatements = generateConstructQueryParams({ endpoint, modelContext });

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
        }),
        (writer) => {
            writer.newLine();
        },
        getTextOfTsNode(
            await generateReturnResponse({
                endpointTypes,
                serviceFile,
                modelContext,
                serviceDefinition,
                endpoint,
                helperManager,
                dependencyManager,
            })
        ),
    ];
}
