import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { OpenAPIWorkspace } from "@fern-api/browser-compatible-fern-workspace";
import { generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";

import { Spec } from "../Spec";

export function convertSpecToWorkspace({
    context,
    spec,
    generatorsConfiguration
}: {
    context: TaskContext;
    spec: Spec;
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
}): FernWorkspace {
    switch (spec.type) {
        case "openapi": {
            const openapi = new OpenAPIWorkspace({
                spec: {
                    parsed: spec.openapi,
                    overrides: spec.overrides,
                    settings: spec.settings
                },
                generatorsConfiguration
            });
            return openapi.toFernWorkspace(
                {
                    context
                },
                spec.settings
            );
        }
    }
}
