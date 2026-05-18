import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace TeamMemberClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class TeamMemberClient {
    protected readonly _options: NormalizedClientOptions<TeamMemberClient.Options>;
    constructor(options: TeamMemberClient.Options);
    /**
     * @param {SeedApi.openapiRequestBodyRef.UpdateTeamMemberRequest} request
     * @param {TeamMemberClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.openapiRequestBodyRef.teamMember.updateTeamMember({
     *         team_member_id: "team_member_id"
     *     })
     */
    updateTeamMember(request: SeedApi.openapiRequestBodyRef.UpdateTeamMemberRequest, requestOptions?: TeamMemberClient.RequestOptions): core.HttpResponsePromise<SeedApi.openapiRequestBodyRef.TeamMember>;
    private __updateTeamMember;
}
