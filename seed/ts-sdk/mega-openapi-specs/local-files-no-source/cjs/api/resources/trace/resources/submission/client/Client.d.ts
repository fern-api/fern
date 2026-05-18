import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace SubmissionClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class SubmissionClient {
    protected readonly _options: NormalizedClientOptions<SubmissionClient.Options>;
    constructor(options: SubmissionClient.Options);
    /**
     * Returns sessionId and execution server URL for session. Spins up server.
     *
     * @param {SeedApi.trace.CreateExecutionSessionSubmissionRequest} request
     * @param {SubmissionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.submission.createExecutionSession({
     *         language: "JAVA"
     *     })
     */
    createExecutionSession(request: SeedApi.trace.CreateExecutionSessionSubmissionRequest, requestOptions?: SubmissionClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.ExecutionSessionResponse>;
    private __createExecutionSession;
    /**
     * Returns execution server URL for session. Returns empty if session isn't registered.
     *
     * @param {SeedApi.trace.GetExecutionSessionSubmissionRequest} request
     * @param {SubmissionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.submission.getExecutionSession({
     *         sessionId: "sessionId"
     *     })
     */
    getExecutionSession(request: SeedApi.trace.GetExecutionSessionSubmissionRequest, requestOptions?: SubmissionClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.ExecutionSessionResponse | null>;
    private __getExecutionSession;
    /**
     * Stops execution session.
     *
     * @param {SeedApi.trace.StopExecutionSessionSubmissionRequest} request
     * @param {SubmissionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.submission.stopExecutionSession({
     *         sessionId: "sessionId"
     *     })
     */
    stopExecutionSession(request: SeedApi.trace.StopExecutionSessionSubmissionRequest, requestOptions?: SubmissionClient.RequestOptions): core.HttpResponsePromise<void>;
    private __stopExecutionSession;
    /**
     * @param {SubmissionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.submission.getExecutionSessionsState()
     */
    getExecutionSessionsState(requestOptions?: SubmissionClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.GetExecutionSessionStateResponse>;
    private __getExecutionSessionsState;
}
