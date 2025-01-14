
import {
    ErrorCollector,
    OpenRpcDocumentConverterNode
} from "@fern-api/docs-parsers";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";

export async function generateFdrFromOpenrpc(
    openrpcPath: AbsoluteFilePath,
    context: TaskContext
): Promise<ReturnType<OpenRpcDocumentConverterNode["convert"]>> {
    // Read and parse the OpenRPC document
    const openrpcContent = await readFile(openrpcPath, "utf-8");
    const openrpcDocument = JSON.parse(openrpcContent) as OpenRPCDocument;

    const openrpcContext: BaseOpenRpcConverterNodeContext = {
        document: openrpcDocument,
        logger: context.logger,
        errors: new ErrorCollector()
    };

    const openrpcFdrJson = new OpenRpcDocumentConverterNode({
        input: openrpcDocument,
        context: openrpcContext,
        accessPath: [],
        pathId: "openrpc parser"
    });

    return openrpcFdrJson.convert();
}
