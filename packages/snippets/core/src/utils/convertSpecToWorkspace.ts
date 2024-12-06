import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { OpenAPIWorkspace } from "@fern-api/browser-compatible-fern-workspace";
import { Spec } from "../Spec";
import { generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";

export async function convertSpecToWorkspace({
    context,
    spec,
    generatorsConfiguration
}: {
    context: TaskContext;
    spec: Spec;
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
}): Promise<FernWorkspace> {
    switch (spec.type) {
        case "openapi": {
            const openapi = new OpenAPIWorkspace({
                spec: {
                    parsed: spec.openapi,
                    overrides: spec.overrides
                },
                generatorsConfiguration
            });
            return await openapi.toFernWorkspace(
                {
                    context
                },
                spec.settings
            );
        }
    }
}
