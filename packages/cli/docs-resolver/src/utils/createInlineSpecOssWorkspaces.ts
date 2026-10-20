import { type OpenAPISpec, type Spec } from "@fern-api/api-workspace-commons";
import { type docsYml } from "@fern-api/configuration";
import { resolveFilepath } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { type OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { getDocsApiSectionsWithInlineSpecs } from "@fern-api/project-structure";

import { createDocsOssWorkspace } from "./createDocsOssWorkspace.js";

function toSpec(spec: docsYml.RawSchemas.ApiSpecConfiguration, absoluteFilepathToDocsConfig: AbsoluteFilePath): Spec {
    const absoluteFilepath = resolveFilepath(spec.path, absoluteFilepathToDocsConfig);
    const absoluteFilepathToOverrides = spec.overrides?.map((override) =>
        resolveFilepath(override, absoluteFilepathToDocsConfig)
    );
    if (spec.type === "graphql") {
        return {
            type: "graphql",
            absoluteFilepath,
            absoluteFilepathToOverrides,
            absoluteFilepathToExamples: undefined,
            namespace: spec.namespace
        };
    }
    return {
        type: "openapi",
        absoluteFilepath,
        absoluteFilepathToOverrides,
        absoluteFilepathToOverlays: resolveFilepath(spec.overlays, absoluteFilepathToDocsConfig),
        source: { type: spec.type === "asyncapi" ? "asyncapi" : "openapi", file: absoluteFilepath },
        namespace: spec.namespace
    } satisfies OpenAPISpec;
}

/**
 * Builds an OSSWorkspace for each docs.yml `api` navigation item that declares its specs inline, so
 * spec-level docs validation still runs when there is no generators.yml to load them from.
 */
export function createInlineSpecOssWorkspaces({
    navigation,
    absoluteFilepathToDocsConfig,
    absoluteFilePathToFernDirectory,
    cliVersion
}: {
    navigation: unknown;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
    absoluteFilePathToFernDirectory: AbsoluteFilePath;
    cliVersion: string;
}): OSSWorkspace[] {
    return getDocsApiSectionsWithInlineSpecs(navigation).map((section) => {
        const specs = (section.specs ?? []).map((spec) => toSpec(spec, absoluteFilepathToDocsConfig));
        return createDocsOssWorkspace({
            specs,
            workspaceName: section.apiName ?? undefined,
            absoluteFilePath: absoluteFilePathToFernDirectory,
            cliVersion
        });
    });
}
