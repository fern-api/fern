import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { OpenAPIWorkspace } from "@fern-api/browser-compatible-fern-workspace";
import { TaskContext } from "@fern-api/task-context";

import { OpenAPISpec } from "../Spec";

export async function convertSpecToWorkspace({ context, spec }: { context: TaskContext; spec: OpenAPISpec }): Promise<FernWorkspace> {
    const openapi = new OpenAPIWorkspace({
        spec: {
            parsed: spec.openapi,
            overrides: spec.overrides,
            settings: spec.settings
        },
        generatorsConfiguration: undefined
    });
    return await openapi.toFernWorkspace(
        {
            context
        },
        spec.settings
    );
}
