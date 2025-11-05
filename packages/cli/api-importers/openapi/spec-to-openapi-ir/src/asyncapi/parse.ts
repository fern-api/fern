import { Schemas, Source, WebsocketChannel } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";

import { ParseOpenAPIOptions } from "../options";
import { ParseAsyncAPIOptions } from "./options";
import { ServerContext } from "./sharedTypes";
import { AsyncAPIV2 } from "./v2";
import { AsyncAPIV2ParserContext } from "./v2/AsyncAPIV2ParserContext";
import { parseAsyncAPIV2 } from "./v2/parseAsyncAPIV2";
import { AsyncAPIV3 } from "./v3";
import { AsyncAPIV3ParserContext } from "./v3/AsyncAPIV3ParserContext";
import { parseAsyncAPIV3 } from "./v3/parseAsyncAPIV3";

export interface AsyncAPIIntermediateRepresentation {
    groupedSchemas: Schemas;
    channels: Record<string, WebsocketChannel> | undefined;
    servers: Array<ServerContext> | undefined;
    basePath: string | undefined;
}

export function parseAsyncAPI({
    document,
    taskContext,
    options,
    source,
    asyncApiOptions,
    namespace
}: {
    document: AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;
    taskContext: TaskContext;
    options: ParseOpenAPIOptions;
    source: Source;
    asyncApiOptions: ParseAsyncAPIOptions;
    namespace: string | undefined;
}): AsyncAPIIntermediateRepresentation {
    const breadcrumbs: string[] = [];
    if (namespace != null) {
        breadcrumbs.push(namespace);
    }
    if (parseFloat(document.asyncapi) < 3) {
        const v2Document = document as AsyncAPIV2.DocumentV2;
        if (v2Document.tags?.[0] != null) {
            breadcrumbs.push(v2Document.tags[0].name);
        } else if (asyncApiOptions.naming !== "v2") {
            // In improved naming, we allow you to not have any prefixes here at all
            // by not specifying tags. Without useImprovedMessageNaming, and no tags,
            // we do still prefix with "Websocket".
            breadcrumbs.push("websocket");
        }
        const context = new AsyncAPIV2ParserContext({
            document: v2Document,
            taskContext,
            options,
            namespace
        });
        return parseAsyncAPIV2({
            context,
            breadcrumbs,
            source,
            asyncApiOptions,
            document: v2Document
        });
    } else {
        const v3Document = document as AsyncAPIV3.DocumentV3;
        const context = new AsyncAPIV3ParserContext({
            document: v3Document,
            taskContext,
            options,
            namespace
        });
        return parseAsyncAPIV3({
            context,
            breadcrumbs,
            source,
            asyncApiOptions,
            document: v3Document
        });
    }
}
