using SeedTrace.Core;

namespace SeedTrace;

public partial class AdminClient
{
    private RawClient _client;

    internal AdminClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Admin.UpdateTestSubmissionStatusAsync(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     new TestSubmissionStatus(new TestSubmissionStatus.Stopped())
    /// );
    /// </code></example>
    public async Task UpdateTestSubmissionStatusAsync(
        string submissionId,
        TestSubmissionStatus request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/admin/store-test-submission-status/{0}",
                        ValueConvert.ToPathParameterString(submissionId)
                    ),
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

    /// <example><code>
    /// await client.Admin.SendTestSubmissionUpdateAsync(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     new TestSubmissionUpdate
    ///     {
    ///         UpdateTime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         UpdateInfo = new TestSubmissionUpdateInfo(
    ///             new TestSubmissionUpdateInfo.Running(RunningSubmissionState.QueueingSubmission)
    ///         ),
    ///     }
    /// );
    /// </code></example>
    public async Task SendTestSubmissionUpdateAsync(
        string submissionId,
        TestSubmissionUpdate request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/admin/store-test-submission-status-v2/{0}",
                        ValueConvert.ToPathParameterString(submissionId)
                    ),
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

    /// <example><code>
    /// await client.Admin.UpdateWorkspaceSubmissionStatusAsync(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     new WorkspaceSubmissionStatus(new WorkspaceSubmissionStatus.Stopped())
    /// );
    /// </code></example>
    public async Task UpdateWorkspaceSubmissionStatusAsync(
        string submissionId,
        WorkspaceSubmissionStatus request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/admin/store-workspace-submission-status/{0}",
                        ValueConvert.ToPathParameterString(submissionId)
                    ),
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

    /// <example><code>
    /// await client.Admin.SendWorkspaceSubmissionUpdateAsync(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     new WorkspaceSubmissionUpdate
    ///     {
    ///         UpdateTime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         UpdateInfo = new WorkspaceSubmissionUpdateInfo(
    ///             new WorkspaceSubmissionUpdateInfo.Running(RunningSubmissionState.QueueingSubmission)
    ///         ),
    ///     }
    /// );
    /// </code></example>
    public async Task SendWorkspaceSubmissionUpdateAsync(
        string submissionId,
        WorkspaceSubmissionUpdate request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/admin/store-workspace-submission-status-v2/{0}",
                        ValueConvert.ToPathParameterString(submissionId)
                    ),
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

    /// <example><code>
    /// await client.Admin.StoreTracedTestCaseAsync(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     "testCaseId",
    ///     new StoreTracedTestCaseRequest
    ///     {
    ///         Result = new TestCaseResultWithStdout
    ///         {
    ///             Result = new TestCaseResult
    ///             {
    ///                 ExpectedResult = new VariableValue(new VariableValue.IntegerValue(1)),
    ///                 ActualResult = new ActualResult(
    ///                     new ActualResult.ValueInner(
    ///                         new VariableValue(new VariableValue.IntegerValue(1))
    ///                     )
    ///                 ),
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
    ///                 ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
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
    ///                                 Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new DebugVariableValue(
    ///                                             new DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
    ///                             },
    ///                             new Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new DebugVariableValue(
    ///                                             new DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
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
    ///                 ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
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
    ///                                 Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new DebugVariableValue(
    ///                                             new DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
    ///                             },
    ///                             new Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new DebugVariableValue(
    ///                                             new DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
    ///                             },
    ///                         },
    ///                     },
    ///                 },
    ///                 Stdout = "stdout",
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task StoreTracedTestCaseAsync(
        string submissionId,
        string testCaseId,
        StoreTracedTestCaseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/admin/store-test-trace/submission/{0}/testCase/{1}",
                        ValueConvert.ToPathParameterString(submissionId),
                        ValueConvert.ToPathParameterString(testCaseId)
                    ),
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

    /// <example><code>
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
    ///             ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
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
    ///                             Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
    ///                                 },
    ///                             },
    ///                         },
    ///                         new Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
    ///                                 },
    ///                             },
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
    ///             ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
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
    ///                             Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
    ///                                 },
    ///                             },
    ///                         },
    ///                         new Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
    ///                                 },
    ///                             },
    ///                         },
    ///                     },
    ///                 },
    ///             },
    ///             Stdout = "stdout",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task StoreTracedTestCaseV2Async(
        string submissionId,
        string testCaseId,
        IEnumerable<TraceResponseV2> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/admin/store-test-trace-v2/submission/{0}/testCase/{1}",
                        ValueConvert.ToPathParameterString(submissionId),
                        ValueConvert.ToPathParameterString(testCaseId)
                    ),
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

    /// <example><code>
    /// await client.Admin.StoreTracedWorkspaceAsync(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     new StoreTracedWorkspaceRequest
    ///     {
    ///         WorkspaceRunDetails = new WorkspaceRunDetails
    ///         {
    ///             ExceptionV2 = new ExceptionV2(
    ///                 new ExceptionV2.Generic(
    ///                     new ExceptionInfo
    ///                     {
    ///                         ExceptionType = "exceptionType",
    ///                         ExceptionMessage = "exceptionMessage",
    ///                         ExceptionStacktrace = "exceptionStacktrace",
    ///                     }
    ///                 )
    ///             ),
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
    ///                 ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
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
    ///                                 Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new DebugVariableValue(
    ///                                             new DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
    ///                             },
    ///                             new Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new DebugVariableValue(
    ///                                             new DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
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
    ///                 ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
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
    ///                                 Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new DebugVariableValue(
    ///                                             new DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
    ///                             },
    ///                             new Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new DebugVariableValue(
    ///                                             new DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
    ///                             },
    ///                         },
    ///                     },
    ///                 },
    ///                 Stdout = "stdout",
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task StoreTracedWorkspaceAsync(
        string submissionId,
        StoreTracedWorkspaceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/admin/store-workspace-trace/submission/{0}",
                        ValueConvert.ToPathParameterString(submissionId)
                    ),
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

    /// <example><code>
    /// await client.Admin.StoreTracedWorkspaceV2Async(
    ///     "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     new List&lt;TraceResponseV2&gt;()
    ///     {
    ///         new TraceResponseV2
    ///         {
    ///             SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             LineNumber = 1,
    ///             File = new TracedFile { Filename = "filename", Directory = "directory" },
    ///             ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
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
    ///                             Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
    ///                                 },
    ///                             },
    ///                         },
    ///                         new Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
    ///                                 },
    ///                             },
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
    ///             ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
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
    ///                             Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
    ///                                 },
    ///                             },
    ///                         },
    ///                         new Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
    ///                                 },
    ///                             },
    ///                         },
    ///                     },
    ///                 },
    ///             },
    ///             Stdout = "stdout",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task StoreTracedWorkspaceV2Async(
        string submissionId,
        IEnumerable<TraceResponseV2> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/admin/store-workspace-trace-v2/submission/{0}",
                        ValueConvert.ToPathParameterString(submissionId)
                    ),
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
