import { CliError } from "@fern-api/task-context";
import {
    type FernConfigMappingDiagnostic,
    type FernResolvedGeneratorGroupInput,
    mapFernConfigToSdkConfigV1,
    parseSdkConfigV1
} from "@postman/sdk-config/sdk-config/v1";
import { LegacyFernWorkspaceAdapter } from "../../../../api/adapter/LegacyFernWorkspaceAdapter.js";
import type { Context } from "../../../../context/Context.js";
import type { Target } from "../../../../sdk/config/Target.js";
import type { Workspace } from "../../../../workspace/Workspace.js";
import { ApiDefinitionMapper } from "./ApiDefinitionMapper.js";
import { TargetMapper } from "./TargetMapper.js";

export declare namespace SdkConfigMapper {
    export interface Selection {
        apiName: string;
        groupName: string | undefined;
        targets: Target[];
    }

    export interface Args {
        selection: Selection;
        workspace: Workspace;
    }

    export interface Config {
        context: Context;
    }

    export interface Result {
        diagnostics: FernConfigMappingDiagnostic[];
        sdkConfig: ReturnType<typeof parseSdkConfigV1>;
    }
}

/** Maps one selected Fern SDK group to a validated, customer-facing SDK Config document. */
export class SdkConfigMapper {
    private readonly apiDefinitionMapper = new ApiDefinitionMapper();
    private readonly context: Context;
    private readonly targetMapper: TargetMapper;

    constructor({ context }: SdkConfigMapper.Config) {
        this.context = context;
        this.targetMapper = new TargetMapper({ context });
    }

    public async map({ selection, workspace }: SdkConfigMapper.Args): Promise<SdkConfigMapper.Result> {
        const apiDefinition = workspace.apis[selection.apiName];
        if (apiDefinition == null) {
            throw new CliError({ message: `API '${selection.apiName}' not found`, code: CliError.Code.ConfigError });
        }
        // The adapter resolves definition-derived API identity and version values that ApiDefinition does not retain.
        const fernWorkspace = await new LegacyFernWorkspaceAdapter({
            context: this.context,
            cliVersion: workspace.cliVersion
        }).adapt(apiDefinition);
        const targetProjections = await Promise.all(
            selection.targets.map((target, index) => this.targetMapper.map({ target, index }))
        );
        const apiProjection = this.apiDefinitionMapper.map(apiDefinition);
        const input: FernResolvedGeneratorGroupInput = {
            apiName: fernWorkspace.definition.rootApiFile.contents.name,
            apiVersion: fernWorkspace.definition.specVersion,
            api: apiProjection.api,
            group: {
                name: selection.groupName,
                // fern.yml currently retains target group membership but not group audience selection.
                audiences: { type: "all" },
                generators: targetProjections.map(({ generator }) => generator)
            }
        };
        const mapped = mapFernConfigToSdkConfigV1(input);
        return {
            diagnostics: [
                ...apiProjection.diagnostics,
                ...targetProjections.flatMap(({ diagnostics }) => diagnostics),
                ...mapped.unsupportedFields
            ],
            sdkConfig: parseSdkConfigV1(mapped.sdkConfig)
        };
    }
}
