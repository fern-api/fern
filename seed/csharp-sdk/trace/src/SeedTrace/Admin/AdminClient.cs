using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
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
    ///     new SeedTrace.TestSubmissionStatus(new SeedTrace.TestSubmissionStatus.Stopped())
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
    ///     new SeedTrace.TestSubmissionUpdate
    ///     {
    ///         UpdateTime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         UpdateInfo = new SeedTrace.TestSubmissionUpdateInfo(
    ///             new SeedTrace.TestSubmissionUpdateInfo.Running(
    ///                 SeedTrace.RunningSubmissionState.QueueingSubmission
    ///             )
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
    ///     new SeedTrace.WorkspaceSubmissionStatus(new SeedTrace.WorkspaceSubmissionStatus.Stopped())
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
    ///     new SeedTrace.WorkspaceSubmissionUpdate
    ///     {
    ///         UpdateTime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         UpdateInfo = new SeedTrace.WorkspaceSubmissionUpdateInfo(
    ///             new SeedTrace.WorkspaceSubmissionUpdateInfo.Running(
    ///                 SeedTrace.RunningSubmissionState.QueueingSubmission
    ///             )
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
    ///     new SeedTrace.StoreTracedTestCaseRequest
    ///     {
    ///         Result = new SeedTrace.TestCaseResultWithStdout
    ///         {
    ///             Result = new SeedTrace.TestCaseResult
    ///             {
    ///                 ExpectedResult = new SeedTrace.VariableValue(
    ///                     new SeedTrace.VariableValue.IntegerValue(1)
    ///                 ),
    ///                 ActualResult = new SeedTrace.ActualResult(
    ///                     new SeedTrace.ActualResult.ValueInner(
    ///                         new SeedTrace.VariableValue(new SeedTrace.VariableValue.IntegerValue(1))
    ///                     )
    ///                 ),
    ///                 Passed = true,
    ///             },
    ///             Stdout = "stdout",
    ///         },
    ///         TraceResponses = new List&lt;SeedTrace.TraceResponse&gt;()
    ///         {
    ///             new SeedTrace.TraceResponse
    ///             {
    ///                 SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///                 LineNumber = 1,
    ///                 ReturnValue = new SeedTrace.DebugVariableValue(
    ///                     new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                 ),
    ///                 ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
    ///                 Stack = new SeedTrace.StackInformation
    ///                 {
    ///                     NumStackFrames = 1,
    ///                     TopStackFrame = new SeedTrace.StackFrame
    ///                     {
    ///                         MethodName = "methodName",
    ///                         LineNumber = 1,
    ///                         Scopes = new List&lt;SeedTrace.Scope&gt;()
    ///                         {
    ///                             new SeedTrace.Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new SeedTrace.DebugVariableValue(
    ///                                             new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
    ///                             },
    ///                             new SeedTrace.Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new SeedTrace.DebugVariableValue(
    ///                                             new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
    ///                             },
    ///                         },
    ///                     },
    ///                 },
    ///                 Stdout = "stdout",
    ///             },
    ///             new SeedTrace.TraceResponse
    ///             {
    ///                 SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///                 LineNumber = 1,
    ///                 ReturnValue = new SeedTrace.DebugVariableValue(
    ///                     new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                 ),
    ///                 ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
    ///                 Stack = new SeedTrace.StackInformation
    ///                 {
    ///                     NumStackFrames = 1,
    ///                     TopStackFrame = new SeedTrace.StackFrame
    ///                     {
    ///                         MethodName = "methodName",
    ///                         LineNumber = 1,
    ///                         Scopes = new List&lt;SeedTrace.Scope&gt;()
    ///                         {
    ///                             new SeedTrace.Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new SeedTrace.DebugVariableValue(
    ///                                             new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
    ///                             },
    ///                             new SeedTrace.Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new SeedTrace.DebugVariableValue(
    ///                                             new SeedTrace.DebugVariableValue.IntegerValue(1)
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
    ///     new List&lt;SeedTrace.TraceResponseV2&gt;()
    ///     {
    ///         new SeedTrace.TraceResponseV2
    ///         {
    ///             SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             LineNumber = 1,
    ///             File = new SeedTrace.TracedFile { Filename = "filename", Directory = "directory" },
    ///             ReturnValue = new SeedTrace.DebugVariableValue(
    ///                 new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///             ),
    ///             ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
    ///             Stack = new SeedTrace.StackInformation
    ///             {
    ///                 NumStackFrames = 1,
    ///                 TopStackFrame = new SeedTrace.StackFrame
    ///                 {
    ///                     MethodName = "methodName",
    ///                     LineNumber = 1,
    ///                     Scopes = new List&lt;SeedTrace.Scope&gt;()
    ///                     {
    ///                         new SeedTrace.Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new SeedTrace.DebugVariableValue(
    ///                                         new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                     )
    ///                                 },
    ///                             },
    ///                         },
    ///                         new SeedTrace.Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new SeedTrace.DebugVariableValue(
    ///                                         new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                     )
    ///                                 },
    ///                             },
    ///                         },
    ///                     },
    ///                 },
    ///             },
    ///             Stdout = "stdout",
    ///         },
    ///         new SeedTrace.TraceResponseV2
    ///         {
    ///             SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             LineNumber = 1,
    ///             File = new SeedTrace.TracedFile { Filename = "filename", Directory = "directory" },
    ///             ReturnValue = new SeedTrace.DebugVariableValue(
    ///                 new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///             ),
    ///             ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
    ///             Stack = new SeedTrace.StackInformation
    ///             {
    ///                 NumStackFrames = 1,
    ///                 TopStackFrame = new SeedTrace.StackFrame
    ///                 {
    ///                     MethodName = "methodName",
    ///                     LineNumber = 1,
    ///                     Scopes = new List&lt;SeedTrace.Scope&gt;()
    ///                     {
    ///                         new SeedTrace.Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new SeedTrace.DebugVariableValue(
    ///                                         new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                     )
    ///                                 },
    ///                             },
    ///                         },
    ///                         new SeedTrace.Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new SeedTrace.DebugVariableValue(
    ///                                         new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                     )
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
    ///     new SeedTrace.StoreTracedWorkspaceRequest
    ///     {
    ///         WorkspaceRunDetails = new SeedTrace.WorkspaceRunDetails
    ///         {
    ///             ExceptionV2 = new SeedTrace.ExceptionV2(
    ///                 new SeedTrace.ExceptionV2.Generic(
    ///                     new SeedTrace.ExceptionInfo
    ///                     {
    ///                         ExceptionType = "exceptionType",
    ///                         ExceptionMessage = "exceptionMessage",
    ///                         ExceptionStacktrace = "exceptionStacktrace",
    ///                     }
    ///                 )
    ///             ),
    ///             Exception = new SeedTrace.ExceptionInfo
    ///             {
    ///                 ExceptionType = "exceptionType",
    ///                 ExceptionMessage = "exceptionMessage",
    ///                 ExceptionStacktrace = "exceptionStacktrace",
    ///             },
    ///             Stdout = "stdout",
    ///         },
    ///         TraceResponses = new List&lt;SeedTrace.TraceResponse&gt;()
    ///         {
    ///             new SeedTrace.TraceResponse
    ///             {
    ///                 SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///                 LineNumber = 1,
    ///                 ReturnValue = new SeedTrace.DebugVariableValue(
    ///                     new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                 ),
    ///                 ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
    ///                 Stack = new SeedTrace.StackInformation
    ///                 {
    ///                     NumStackFrames = 1,
    ///                     TopStackFrame = new SeedTrace.StackFrame
    ///                     {
    ///                         MethodName = "methodName",
    ///                         LineNumber = 1,
    ///                         Scopes = new List&lt;SeedTrace.Scope&gt;()
    ///                         {
    ///                             new SeedTrace.Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new SeedTrace.DebugVariableValue(
    ///                                             new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
    ///                             },
    ///                             new SeedTrace.Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new SeedTrace.DebugVariableValue(
    ///                                             new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
    ///                             },
    ///                         },
    ///                     },
    ///                 },
    ///                 Stdout = "stdout",
    ///             },
    ///             new SeedTrace.TraceResponse
    ///             {
    ///                 SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///                 LineNumber = 1,
    ///                 ReturnValue = new SeedTrace.DebugVariableValue(
    ///                     new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                 ),
    ///                 ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
    ///                 Stack = new SeedTrace.StackInformation
    ///                 {
    ///                     NumStackFrames = 1,
    ///                     TopStackFrame = new SeedTrace.StackFrame
    ///                     {
    ///                         MethodName = "methodName",
    ///                         LineNumber = 1,
    ///                         Scopes = new List&lt;SeedTrace.Scope&gt;()
    ///                         {
    ///                             new SeedTrace.Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new SeedTrace.DebugVariableValue(
    ///                                             new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                         )
    ///                                     },
    ///                                 },
    ///                             },
    ///                             new SeedTrace.Scope
    ///                             {
    ///                                 Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                                 {
    ///                                     {
    ///                                         "variables",
    ///                                         new SeedTrace.DebugVariableValue(
    ///                                             new SeedTrace.DebugVariableValue.IntegerValue(1)
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
    ///     new List&lt;SeedTrace.TraceResponseV2&gt;()
    ///     {
    ///         new SeedTrace.TraceResponseV2
    ///         {
    ///             SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             LineNumber = 1,
    ///             File = new SeedTrace.TracedFile { Filename = "filename", Directory = "directory" },
    ///             ReturnValue = new SeedTrace.DebugVariableValue(
    ///                 new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///             ),
    ///             ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
    ///             Stack = new SeedTrace.StackInformation
    ///             {
    ///                 NumStackFrames = 1,
    ///                 TopStackFrame = new SeedTrace.StackFrame
    ///                 {
    ///                     MethodName = "methodName",
    ///                     LineNumber = 1,
    ///                     Scopes = new List&lt;SeedTrace.Scope&gt;()
    ///                     {
    ///                         new SeedTrace.Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new SeedTrace.DebugVariableValue(
    ///                                         new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                     )
    ///                                 },
    ///                             },
    ///                         },
    ///                         new SeedTrace.Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new SeedTrace.DebugVariableValue(
    ///                                         new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                     )
    ///                                 },
    ///                             },
    ///                         },
    ///                     },
    ///                 },
    ///             },
    ///             Stdout = "stdout",
    ///         },
    ///         new SeedTrace.TraceResponseV2
    ///         {
    ///             SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             LineNumber = 1,
    ///             File = new SeedTrace.TracedFile { Filename = "filename", Directory = "directory" },
    ///             ReturnValue = new SeedTrace.DebugVariableValue(
    ///                 new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///             ),
    ///             ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
    ///             Stack = new SeedTrace.StackInformation
    ///             {
    ///                 NumStackFrames = 1,
    ///                 TopStackFrame = new SeedTrace.StackFrame
    ///                 {
    ///                     MethodName = "methodName",
    ///                     LineNumber = 1,
    ///                     Scopes = new List&lt;SeedTrace.Scope&gt;()
    ///                     {
    ///                         new SeedTrace.Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new SeedTrace.DebugVariableValue(
    ///                                         new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                     )
    ///                                 },
    ///                             },
    ///                         },
    ///                         new SeedTrace.Scope
    ///                         {
    ///                             Variables = new Dictionary&lt;string, SeedTrace.DebugVariableValue&gt;()
    ///                             {
    ///                                 {
    ///                                     "variables",
    ///                                     new SeedTrace.DebugVariableValue(
    ///                                         new SeedTrace.DebugVariableValue.IntegerValue(1)
    ///                                     )
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
