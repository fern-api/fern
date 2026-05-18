import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace AdminClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class AdminClient {
    protected readonly _options: NormalizedClientOptions<AdminClient.Options>;
    constructor(options: AdminClient.Options);
    /**
     * @param {SeedApi.trace.UpdateTestSubmissionStatusAdminRequest} request
     * @param {AdminClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.admin.updateTestSubmissionStatus({
     *         submissionId: "submissionId",
     *         body: {
     *             type: "stopped"
     *         }
     *     })
     */
    updateTestSubmissionStatus(request: SeedApi.trace.UpdateTestSubmissionStatusAdminRequest, requestOptions?: AdminClient.RequestOptions): core.HttpResponsePromise<void>;
    private __updateTestSubmissionStatus;
    /**
     * @param {SeedApi.trace.SendTestSubmissionUpdateAdminRequest} request
     * @param {AdminClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.admin.sendTestSubmissionUpdate({
     *         submissionId: "submissionId",
     *         body: {
     *             updateTime: "2024-01-15T09:30:00Z",
     *             updateInfo: {
     *                 type: "running"
     *             }
     *         }
     *     })
     */
    sendTestSubmissionUpdate(request: SeedApi.trace.SendTestSubmissionUpdateAdminRequest, requestOptions?: AdminClient.RequestOptions): core.HttpResponsePromise<void>;
    private __sendTestSubmissionUpdate;
    /**
     * @param {SeedApi.trace.UpdateWorkspaceSubmissionStatusAdminRequest} request
     * @param {AdminClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.admin.updateWorkspaceSubmissionStatus({
     *         submissionId: "submissionId",
     *         body: {
     *             type: "stopped"
     *         }
     *     })
     */
    updateWorkspaceSubmissionStatus(request: SeedApi.trace.UpdateWorkspaceSubmissionStatusAdminRequest, requestOptions?: AdminClient.RequestOptions): core.HttpResponsePromise<void>;
    private __updateWorkspaceSubmissionStatus;
    /**
     * @param {SeedApi.trace.SendWorkspaceSubmissionUpdateAdminRequest} request
     * @param {AdminClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.admin.sendWorkspaceSubmissionUpdate({
     *         submissionId: "submissionId",
     *         body: {
     *             updateTime: "2024-01-15T09:30:00Z",
     *             updateInfo: {
     *                 type: "running"
     *             }
     *         }
     *     })
     */
    sendWorkspaceSubmissionUpdate(request: SeedApi.trace.SendWorkspaceSubmissionUpdateAdminRequest, requestOptions?: AdminClient.RequestOptions): core.HttpResponsePromise<void>;
    private __sendWorkspaceSubmissionUpdate;
    /**
     * @param {SeedApi.trace.StoreTracedTestCaseAdminRequest} request
     * @param {AdminClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.admin.storeTracedTestCase({
     *         submissionId: "submissionId",
     *         testCaseId: "testCaseId",
     *         result: {
     *             result: {
     *                 expectedResult: {
     *                     type: "integerValue"
     *                 },
     *                 actualResult: {
     *                     type: "value"
     *                 },
     *                 passed: true
     *             },
     *             stdout: "stdout"
     *         },
     *         traceResponses: [{
     *                 submissionId: "submissionId",
     *                 lineNumber: 1,
     *                 stack: {
     *                     numStackFrames: 1
     *                 }
     *             }]
     *     })
     */
    storeTracedTestCase(request: SeedApi.trace.StoreTracedTestCaseAdminRequest, requestOptions?: AdminClient.RequestOptions): core.HttpResponsePromise<void>;
    private __storeTracedTestCase;
    /**
     * @param {SeedApi.trace.StoreTracedTestCaseV2AdminRequest} request
     * @param {AdminClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.admin.storeTracedTestCaseV2({
     *         submissionId: "submissionId",
     *         testCaseId: "testCaseId",
     *         body: [{
     *                 submissionId: "submissionId",
     *                 lineNumber: 1,
     *                 file: {
     *                     filename: "filename",
     *                     directory: "directory"
     *                 },
     *                 stack: {
     *                     numStackFrames: 1
     *                 }
     *             }]
     *     })
     */
    storeTracedTestCaseV2(request: SeedApi.trace.StoreTracedTestCaseV2AdminRequest, requestOptions?: AdminClient.RequestOptions): core.HttpResponsePromise<void>;
    private __storeTracedTestCaseV2;
    /**
     * @param {SeedApi.trace.StoreTracedWorkspaceAdminRequest} request
     * @param {AdminClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.admin.storeTracedWorkspace({
     *         submissionId: "submissionId",
     *         workspaceRunDetails: {
     *             stdout: "stdout"
     *         },
     *         traceResponses: [{
     *                 submissionId: "submissionId",
     *                 lineNumber: 1,
     *                 stack: {
     *                     numStackFrames: 1
     *                 }
     *             }]
     *     })
     */
    storeTracedWorkspace(request: SeedApi.trace.StoreTracedWorkspaceAdminRequest, requestOptions?: AdminClient.RequestOptions): core.HttpResponsePromise<void>;
    private __storeTracedWorkspace;
    /**
     * @param {SeedApi.trace.StoreTracedWorkspaceV2AdminRequest} request
     * @param {AdminClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.admin.storeTracedWorkspaceV2({
     *         submissionId: "submissionId",
     *         body: [{
     *                 submissionId: "submissionId",
     *                 lineNumber: 1,
     *                 file: {
     *                     filename: "filename",
     *                     directory: "directory"
     *                 },
     *                 stack: {
     *                     numStackFrames: 1
     *                 }
     *             }]
     *     })
     */
    storeTracedWorkspaceV2(request: SeedApi.trace.StoreTracedWorkspaceV2AdminRequest, requestOptions?: AdminClient.RequestOptions): core.HttpResponsePromise<void>;
    private __storeTracedWorkspaceV2;
}
