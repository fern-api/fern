import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { StatementStructures, WriterFunction } from "ts-morph";
import { ParsedClientEndpoint } from "../parse-endpoint/ParsedClientEndpoint";
import { generateConstructQueryParams } from "./generateConstructQueryParams";
import { generateFetcherCall } from "./generateFetcherCall";
import { generateReturnResponse } from "./generateReturnResponse";

export function generateEndpointMethodBody({
    endpoint,
    file,
}: {
    endpoint: ParsedClientEndpoint;
    file: SdkFile;
}): (StatementStructures | WriterFunction | string)[] {
    const queryParameterStatements = generateConstructQueryParams({ endpoint, file });

    const statements: (StatementStructures | WriterFunction | string)[] = [];

    statements.push(
        (writer) => {
            if (queryParameterStatements.length === 0) {
                return;
            }
            for (const statement of queryParameterStatements) {
                writer.writeLine(getTextOfTsNode(statement));
            }
            writer.newLine();
        },
        generateFetcherCall({
            endpoint,
            file,
        }),
        (writer) => {
            writer.newLine();
        },
        ...generateReturnResponse({ endpoint, file }).map(getTextOfTsNode)
    );

    return statements;
}
