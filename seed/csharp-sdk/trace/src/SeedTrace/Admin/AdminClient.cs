using System.Net.Http;
using System.Threading;
using global::System.Threading.Tasks;
using SeedTrace.Core;

namespace SeedTrace;

public partial class AdminClient
{
    private RawClient _client;

    internal AdminClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Admin.UpdateTestSubmissionStatusAsync(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     "no-properties-union"
    /// );
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task UpdateTestSubmissionStatusAsync(
        string submissionId,
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path =
                        $"/admin/store-test-submission-status/{JsonUtils.SerializeAsString(submissionId)}",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example>
    /// <code>
    /// await client.Admin.SendTestSubmissionUpdateAsync(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     new TestSubmissionUpdate
    ///     {
    ///         UpdateTime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         UpdateInfo = RunningSubmissionState.QueueingSubmission,
    ///     }
    /// );
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task SendTestSubmissionUpdateAsync(
        string submissionId,
        TestSubmissionUpdate request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path =
                        $"/admin/store-test-submission-status-v2/{JsonUtils.SerializeAsString(submissionId)}",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example>
    /// <code>
    /// await client.Admin.UpdateWorkspaceSubmissionStatusAsync(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     "no-properties-union"
    /// );
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task UpdateWorkspaceSubmissionStatusAsync(
        string submissionId,
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path =
                        $"/admin/store-workspace-submission-status/{JsonUtils.SerializeAsString(submissionId)}",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example>
    /// <code>
    /// await client.Admin.SendWorkspaceSubmissionUpdateAsync(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     new WorkspaceSubmissionUpdate
    ///     {
    ///         UpdateTime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         UpdateInfo = RunningSubmissionState.QueueingSubmission,
    ///     }
    /// );
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task SendWorkspaceSubmissionUpdateAsync(
        string submissionId,
        WorkspaceSubmissionUpdate request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path =
                        $"/admin/store-workspace-submission-status-v2/{JsonUtils.SerializeAsString(submissionId)}",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example>
    /// <code>
    /// await client.Admin.StoreTracedTestCaseAsync(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     "testCaseId",
    ///     new StoreTracedTestCaseRequest
    ///     {
    ///         Result = new TestCaseResultWithStdout
    ///         {
    ///             Result = new TestCaseResult
    ///             {
    ///                 ExpectedResult = 1,
    ///                 ActualResult = 1,
    ///                 Passed = true,
    ///             },
    ///             Stdout = "stdout",
    ///         },
    ///         TraceResponses = new List&lt;TraceResponse&gt;()
    ///         {
    ///             new TraceResponse
    ///             {
    ///                 SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///                 LineNumber = 1,
    ///                 ReturnValue = 1,
    ///                 ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
    ///                 Stack = new StackInformation
    ///                 {
    ///                     NumStackFrames = 1,
    ///                     TopStackFrame = new StackFrame
    ///                     {
    ///                         MethodName = "methodName",
    ///                         LineNumber = 1,
    ///                         Scopes = new List&lt;Scope&gt;()
    ///                         {
    ///                             new Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                             },
    ///                             new Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                             },
    ///                         },
    ///                     },
    ///                 },
    ///                 Stdout = "stdout",
    ///             },
    ///             new TraceResponse
    ///             {
    ///                 SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///                 LineNumber = 1,
    ///                 ReturnValue = 1,
    ///                 ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
    ///                 Stack = new StackInformation
    ///                 {
    ///                     NumStackFrames = 1,
    ///                     TopStackFrame = new StackFrame
    ///                     {
    ///                         MethodName = "methodName",
    ///                         LineNumber = 1,
    ///                         Scopes = new List&lt;Scope&gt;()
    ///                         {
    ///                             new Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                             },
    ///                             new Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                             },
    ///                         },
    ///                     },
    ///                 },
    ///                 Stdout = "stdout",
    ///             },
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task StoreTracedTestCaseAsync(
        string submissionId,
        string testCaseId,
        StoreTracedTestCaseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path =
                        $"/admin/store-test-trace/submission/{JsonUtils.SerializeAsString(submissionId)}/testCase/{JsonUtils.SerializeAsString(testCaseId)}",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example>
    /// <code>
    /// await client.Admin.StoreTracedTestCaseV2Async(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     "testCaseId",
    ///     new List&lt;TraceResponseV2&gt;()
    ///     {
    ///         new TraceResponseV2
    ///         {
    ///             SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             LineNumber = 1,
    ///             File = new TracedFile { Filename = "filename", Directory = "directory" },
    ///             ReturnValue = 1,
    ///             ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
    ///             Stack = new StackInformation
    ///             {
    ///                 NumStackFrames = 1,
    ///                 TopStackFrame = new StackFrame
    ///                 {
    ///                     MethodName = "methodName",
    ///                     LineNumber = 1,
    ///                     Scopes = new List&lt;Scope&gt;()
    ///                     {
    ///                         new Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                         },
    ///                         new Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                         },
    ///                     },
    ///                 },
    ///             },
    ///             Stdout = "stdout",
    ///         },
    ///         new TraceResponseV2
    ///         {
    ///             SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             LineNumber = 1,
    ///             File = new TracedFile { Filename = "filename", Directory = "directory" },
    ///             ReturnValue = 1,
    ///             ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
    ///             Stack = new StackInformation
    ///             {
    ///                 NumStackFrames = 1,
    ///                 TopStackFrame = new StackFrame
    ///                 {
    ///                     MethodName = "methodName",
    ///                     LineNumber = 1,
    ///                     Scopes = new List&lt;Scope&gt;()
    ///                     {
    ///                         new Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                         },
    ///                         new Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                         },
    ///                     },
    ///                 },
    ///             },
    ///             Stdout = "stdout",
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task StoreTracedTestCaseV2Async(
        string submissionId,
        string testCaseId,
        IEnumerable<TraceResponseV2> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path =
                        $"/admin/store-test-trace-v2/submission/{JsonUtils.SerializeAsString(submissionId)}/testCase/{JsonUtils.SerializeAsString(testCaseId)}",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example>
    /// <code>
    /// await client.Admin.StoreTracedWorkspaceAsync(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     new StoreTracedWorkspaceRequest
    ///     {
    ///         WorkspaceRunDetails = new WorkspaceRunDetails
    ///         {
    ///             ExceptionV2 = new ExceptionInfo
    ///             {
    ///                 ExceptionType = "exceptionType",
    ///                 ExceptionMessage = "exceptionMessage",
    ///                 ExceptionStacktrace = "exceptionStacktrace",
    ///             },
    ///             Exception = new ExceptionInfo
    ///             {
    ///                 ExceptionType = "exceptionType",
    ///                 ExceptionMessage = "exceptionMessage",
    ///                 ExceptionStacktrace = "exceptionStacktrace",
    ///             },
    ///             Stdout = "stdout",
    ///         },
    ///         TraceResponses = new List&lt;TraceResponse&gt;()
    ///         {
    ///             new TraceResponse
    ///             {
    ///                 SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///                 LineNumber = 1,
    ///                 ReturnValue = 1,
    ///                 ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
    ///                 Stack = new StackInformation
    ///                 {
    ///                     NumStackFrames = 1,
    ///                     TopStackFrame = new StackFrame
    ///                     {
    ///                         MethodName = "methodName",
    ///                         LineNumber = 1,
    ///                         Scopes = new List&lt;Scope&gt;()
    ///                         {
    ///                             new Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                             },
    ///                             new Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                             },
    ///                         },
    ///                     },
    ///                 },
    ///                 Stdout = "stdout",
    ///             },
    ///             new TraceResponse
    ///             {
    ///                 SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///                 LineNumber = 1,
    ///                 ReturnValue = 1,
    ///                 ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
    ///                 Stack = new StackInformation
    ///                 {
    ///                     NumStackFrames = 1,
    ///                     TopStackFrame = new StackFrame
    ///                     {
    ///                         MethodName = "methodName",
    ///                         LineNumber = 1,
    ///                         Scopes = new List&lt;Scope&gt;()
    ///                         {
    ///                             new Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                             },
    ///                             new Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                             },
    ///                         },
    ///                     },
    ///                 },
    ///                 Stdout = "stdout",
    ///             },
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task StoreTracedWorkspaceAsync(
        string submissionId,
        StoreTracedWorkspaceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path =
                        $"/admin/store-workspace-trace/submission/{JsonUtils.SerializeAsString(submissionId)}",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example>
    /// <code>
    /// await client.Admin.StoreTracedWorkspaceV2Async(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     new List&lt;TraceResponseV2&gt;()
    ///     {
    ///         new TraceResponseV2
    ///         {
    ///             SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             LineNumber = 1,
    ///             File = new TracedFile { Filename = "filename", Directory = "directory" },
    ///             ReturnValue = 1,
    ///             ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
    ///             Stack = new StackInformation
    ///             {
    ///                 NumStackFrames = 1,
    ///                 TopStackFrame = new StackFrame
    ///                 {
    ///                     MethodName = "methodName",
    ///                     LineNumber = 1,
    ///                     Scopes = new List&lt;Scope&gt;()
    ///                     {
    ///                         new Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                         },
    ///                         new Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                         },
    ///                     },
    ///                 },
    ///             },
    ///             Stdout = "stdout",
    ///         },
    ///         new TraceResponseV2
    ///         {
    ///             SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             LineNumber = 1,
    ///             File = new TracedFile { Filename = "filename", Directory = "directory" },
    ///             ReturnValue = 1,
    ///             ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
    ///             Stack = new StackInformation
    ///             {
    ///                 NumStackFrames = 1,
    ///                 TopStackFrame = new StackFrame
    ///                 {
    ///                     MethodName = "methodName",
    ///                     LineNumber = 1,
    ///                     Scopes = new List&lt;Scope&gt;()
    ///                     {
    ///                         new Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                         },
    ///                         new Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, object&gt;() { { "variables", 1 } },
    ///                         },
    ///                     },
    ///                 },
    ///             },
    ///             Stdout = "stdout",
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task StoreTracedWorkspaceV2Async(
        string submissionId,
        IEnumerable<TraceResponseV2> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path =
                        $"/admin/store-workspace-trace-v2/submission/{JsonUtils.SerializeAsString(submissionId)}",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
