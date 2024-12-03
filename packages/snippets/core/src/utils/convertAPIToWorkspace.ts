import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { OpenAPIWorkspace } from "@fern-api/browser-compatible-fern-workspace";
import { API } from "../API";
import { generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";

export async function convertAPIToWorkspace({
    context,
    api,
    generatorsConfiguration,
    settings
}: {
    context: TaskContext;
    api: API;
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
    settings: OpenAPIWorkspace.Settings | undefined;
}): Promise<FernWorkspace> {
    switch (api.type) {
        case "openapi": {
            const openapi = new OpenAPIWorkspace({
                spec: { parsed: api.openapi },
                generatorsConfiguration
            });
            return await openapi.toFernWorkspace({ context }, settings);
        }
    }
}
