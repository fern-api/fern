import { type OpenAPISpec, type Spec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";

/**
 * The workspace for an API that docs.yml declares inline. It has no generators configuration or changelog.
 *
 * AsyncAPI is represented by an OpenAPISpec whose `source.type` is "asyncapi", because OSSWorkspace converts both
 * formats into the same IR. So the specs that are OpenAPI-compatible are the ones typed "openapi".
 */
export function createDocsOssWorkspace({
    specs,
    workspaceName,
    absoluteFilePath,
    cliVersion
}: {
    specs: Spec[];
    workspaceName: string | undefined;
    absoluteFilePath: AbsoluteFilePath;
    cliVersion: string;
}): OSSWorkspace {
    return new OSSWorkspace({
        specs: specs.filter((spec): spec is OpenAPISpec => spec.type === "openapi"),
        allSpecs: specs,
        workspaceName,
        absoluteFilePath,
        generatorsConfiguration: undefined,
        changelog: undefined,
        cliVersion
    });
}
