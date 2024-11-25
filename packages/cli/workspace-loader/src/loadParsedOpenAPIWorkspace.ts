import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { ParsedOpenAPISpec, ParsedOpenAPIWorkspace, WorkspaceLoader } from "@fern-api/lazy-fern-workspace";

export async function loadParsedOpenAPIWorkspace({
    specs,
    generatorsConfigurationSchema,
    cliVersion
}: {
    specs: ParsedOpenAPISpec[];
    generatorsConfigurationSchema: generatorsYml.GeneratorsConfigurationSchema;
    cliVersion: string;
}): Promise<WorkspaceLoader.Result> {
    return {
        didSucceed: true,
        workspace: new ParsedOpenAPIWorkspace({
            specs,
            workspaceName: "openapi",
            absoluteFilePath: AbsoluteFilePath.of("<memory>"),
            generatorsConfiguration: {
                api: undefined,
                defaultGroup: undefined,
                reviewers: undefined,
                groups: [],
                whitelabel: undefined,
                rawConfiguration: generatorsConfigurationSchema,
                absolutePathToConfiguration: AbsoluteFilePath.of("<memory>")
            },
            cliVersion,
            changelog: undefined
        })
    };
}
