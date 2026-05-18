import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace ProblemClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ProblemClient {
    protected readonly _options: NormalizedClientOptions<ProblemClient.Options>;
    constructor(options: ProblemClient.Options);
    /**
     * Creates a problem
     *
     * @param {SeedApi.trace.CreateProblemRequest} request
     * @param {ProblemClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.problem.createProblem({
     *         problemName: "problemName",
     *         problemDescription: {
     *             boards: [{
     *                     type: "html"
     *                 }]
     *         },
     *         files: {
     *             "key": {
     *                 solutionFile: {
     *                     filename: "filename",
     *                     contents: "contents"
     *                 },
     *                 readOnlyFiles: [{
     *                         filename: "filename",
     *                         contents: "contents"
     *                     }]
     *             }
     *         },
     *         inputParams: [{
     *                 variableType: {
     *                     type: "integerType"
     *                 },
     *                 name: "name"
     *             }],
     *         outputType: {
     *             type: "integerType"
     *         },
     *         testcases: [{
     *                 testCase: {
     *                     id: "id",
     *                     params: [{
     *                             type: "integerValue"
     *                         }]
     *                 },
     *                 expectedResult: {
     *                     type: "integerValue"
     *                 }
     *             }],
     *         methodName: "methodName"
     *     })
     */
    createProblem(request: SeedApi.trace.CreateProblemRequest, requestOptions?: ProblemClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.CreateProblemResponse>;
    private __createProblem;
    /**
     * Updates a problem
     *
     * @param {SeedApi.trace.UpdateProblemProblemRequest} request
     * @param {ProblemClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.problem.updateProblem({
     *         problemId: "problemId",
     *         body: {
     *             problemName: "problemName",
     *             problemDescription: {
     *                 boards: [{
     *                         type: "html"
     *                     }]
     *             },
     *             files: {
     *                 "key": {
     *                     solutionFile: {
     *                         filename: "filename",
     *                         contents: "contents"
     *                     },
     *                     readOnlyFiles: [{
     *                             filename: "filename",
     *                             contents: "contents"
     *                         }]
     *                 }
     *             },
     *             inputParams: [{
     *                     variableType: {
     *                         type: "integerType"
     *                     },
     *                     name: "name"
     *                 }],
     *             outputType: {
     *                 type: "integerType"
     *             },
     *             testcases: [{
     *                     testCase: {
     *                         id: "id",
     *                         params: [{
     *                                 type: "integerValue"
     *                             }]
     *                     },
     *                     expectedResult: {
     *                         type: "integerValue"
     *                     }
     *                 }],
     *             methodName: "methodName"
     *         }
     *     })
     */
    updateProblem(request: SeedApi.trace.UpdateProblemProblemRequest, requestOptions?: ProblemClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.UpdateProblemResponse>;
    private __updateProblem;
    /**
     * Soft deletes a problem
     *
     * @param {SeedApi.trace.DeleteProblemProblemRequest} request
     * @param {ProblemClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.problem.deleteProblem({
     *         problemId: "problemId"
     *     })
     */
    deleteProblem(request: SeedApi.trace.DeleteProblemProblemRequest, requestOptions?: ProblemClient.RequestOptions): core.HttpResponsePromise<void>;
    private __deleteProblem;
    /**
     * Returns default starter files for problem
     *
     * @param {SeedApi.trace.GetDefaultStarterFilesProblemRequest} request
     * @param {ProblemClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.problem.getDefaultStarterFiles({
     *         inputParams: [{
     *                 variableType: {
     *                     type: "integerType"
     *                 },
     *                 name: "name"
     *             }],
     *         outputType: {
     *             type: "integerType"
     *         },
     *         methodName: "methodName"
     *     })
     */
    getDefaultStarterFiles(request: SeedApi.trace.GetDefaultStarterFilesProblemRequest, requestOptions?: ProblemClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.GetDefaultStarterFilesResponse>;
    private __getDefaultStarterFiles;
}
