import { IntermediateRepresentation } from "@fernapi/ir-generation";
import { Directory } from "ts-morph";

/* eslint-disable */

export function generateClientFiles({
    directory,
    modelDirectory,
    intermediateRepresentation,
}: {
    directory: Directory;
    modelDirectory: Directory;
    intermediateRepresentation: IntermediateRepresentation;
}): void {
    for (const httpService of intermediateRepresentation.services.http) {
    }

    for (const webSocketService of intermediateRepresentation.services.webSocket) {
    }
}
