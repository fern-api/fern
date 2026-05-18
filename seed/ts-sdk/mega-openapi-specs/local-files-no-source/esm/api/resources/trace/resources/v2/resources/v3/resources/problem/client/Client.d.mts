import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../../../index.mjs";
export declare namespace ProblemClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ProblemClient {
    protected readonly _options: NormalizedClientOptions<ProblemClient.Options>;
    constructor(options: ProblemClient.Options);
    /**
     * Returns lightweight versions of all problems
     *
     * @param {ProblemClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.v2.v3.problem.getLightweightProblems()
     */
    getLightweightProblems(requestOptions?: ProblemClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.V2V3LightweightProblemInfoV2[]>;
    private __getLightweightProblems;
    /**
     * Returns latest versions of all problems
     *
     * @param {ProblemClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.v2.v3.problem.getProblems()
     */
    getProblems(requestOptions?: ProblemClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.V2V3ProblemInfoV2[]>;
    private __getProblems;
    /**
     * Returns latest version of a problem
     *
     * @param {SeedApi.trace.v2.v3.GetLatestProblemProblemRequest} request
     * @param {ProblemClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.v2.v3.problem.getLatestProblem({
     *         problemId: "problemId"
     *     })
     */
    getLatestProblem(request: SeedApi.trace.v2.v3.GetLatestProblemProblemRequest, requestOptions?: ProblemClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.V2V3ProblemInfoV2>;
    private __getLatestProblem;
    /**
     * Returns requested version of a problem
     *
     * @param {SeedApi.trace.v2.v3.GetProblemVersionProblemRequest} request
     * @param {ProblemClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.v2.v3.problem.getProblemVersion({
     *         problemId: "problemId",
     *         problemVersion: 1
     *     })
     */
    getProblemVersion(request: SeedApi.trace.v2.v3.GetProblemVersionProblemRequest, requestOptions?: ProblemClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.V2V3ProblemInfoV2>;
    private __getProblemVersion;
}
