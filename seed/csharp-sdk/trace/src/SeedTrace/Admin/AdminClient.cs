using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using SeedTrace.Core;

#nullable enable

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
    ///     &quot;d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32&quot;,
    ///     &quot;no-properties-union&quot;
    /// );
    /// </code>
    /// </example>
    public async Task UpdateTestSubmissionStatusAsync(
        string submissionId,
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"/admin/store-test-submission-status/{submissionId}",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Admin.SendTestSubmissionUpdateAsync(
    ///     &quot;d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32&quot;,
    ///     new TestSubmissionUpdate
    ///     {
    ///         UpdateTime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         UpdateInfo = RunningSubmissionState.QueueingSubmission,
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task SendTestSubmissionUpdateAsync(
        string submissionId,
        TestSubmissionUpdate request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"/admin/store-test-submission-status-v2/{submissionId}",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Admin.UpdateWorkspaceSubmissionStatusAsync(
    ///     &quot;d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32&quot;,
    ///     &quot;no-properties-union&quot;
    /// );
    /// </code>
    /// </example>
    public async Task UpdateWorkspaceSubmissionStatusAsync(
        string submissionId,
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"/admin/store-workspace-submission-status/{submissionId}",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Admin.SendWorkspaceSubmissionUpdateAsync(
    ///     &quot;d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32&quot;,
    ///     new WorkspaceSubmissionUpdate
    ///     {
    ///         UpdateTime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         UpdateInfo = RunningSubmissionState.QueueingSubmission,
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task SendWorkspaceSubmissionUpdateAsync(
        string submissionId,
        WorkspaceSubmissionUpdate request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"/admin/store-workspace-submission-status-v2/{submissionId}",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Admin.StoreTracedTestCaseAsync(
    ///     &quot;d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32&quot;,
    ///     &quot;string&quot;,
    ///     new StoreTracedTestCaseRequest
    ///     {
    ///         Result = new TestCaseResultWithStdout
    ///         {
    ///             Result = new TestCaseResult
    ///             {
    ///                 ExpectedResult = 1,
    ///                 ActualResult = new Dictionary&lt;object, object?&gt;() { { &quot;key&quot;, &quot;value&quot; } },
    ///                 Passed = true,
    ///             },
    ///             Stdout = &quot;string&quot;,
    ///         },
    ///         TraceResponses = new List&lt;TraceResponse&gt;()
    ///         {
    ///             new TraceResponse
    ///             {
    ///                 SubmissionId = &quot;d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32&quot;,
    ///                 LineNumber = 1,
    ///                 ReturnValue = 1,
    ///                 ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
    ///                 Stack = new StackInformation
    ///                 {
    ///                     NumStackFrames = 1,
    ///                     TopStackFrame = new StackFrame
    ///                     {
    ///                         MethodName = &quot;string&quot;,
    ///                         LineNumber = 1,
    ///                         Scopes = new List&lt;Scope&gt;()
    ///                         {
    ///                             new Scope { Variables = new Dictionary&lt;string, object&gt;() { } },
    ///                         },
    ///                     },
    ///                 },
    ///                 Stdout = &quot;string&quot;,
    ///             },
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task StoreTracedTestCaseAsync(
        string submissionId,
        string testCaseId,
        StoreTracedTestCaseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"/admin/store-test-trace/submission/{submissionId}/testCase/{testCaseId}",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Admin.StoreTracedTestCaseV2Async(
    ///     &quot;d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32&quot;,
    ///     &quot;string&quot;,
    ///     new List&lt;TraceResponseV2&gt;()
    ///     {
    ///         new TraceResponseV2
    ///         {
    ///             SubmissionId = &quot;d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32&quot;,
    ///             LineNumber = 1,
    ///             File = new TracedFile { Filename = &quot;string&quot;, Directory = &quot;string&quot; },
    ///             ReturnValue = 1,
    ///             ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
    ///             Stack = new StackInformation
    ///             {
    ///                 NumStackFrames = 1,
    ///                 TopStackFrame = new StackFrame
    ///                 {
    ///                     MethodName = &quot;string&quot;,
    ///                     LineNumber = 1,
    ///                     Scopes = new List&lt;Scope&gt;()
    ///                     {
    ///                         new Scope { Variables = new Dictionary&lt;string, object&gt;() { } },
    ///                     },
    ///                 },
    ///             },
    ///             Stdout = &quot;string&quot;,
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task StoreTracedTestCaseV2Async(
        string submissionId,
        string testCaseId,
        IEnumerable<TraceResponseV2> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path =
                    $"/admin/store-test-trace-v2/submission/{submissionId}/testCase/{testCaseId}",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Admin.StoreTracedWorkspaceAsync(
    ///     &quot;d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32&quot;,
    ///     new StoreTracedWorkspaceRequest
    ///     {
    ///         WorkspaceRunDetails = new WorkspaceRunDetails
    ///         {
    ///             ExceptionV2 = new ExceptionInfo
    ///             {
    ///                 ExceptionType = &quot;string&quot;,
    ///                 ExceptionMessage = &quot;string&quot;,
    ///                 ExceptionStacktrace = &quot;string&quot;,
    ///             },
    ///             Exception = new ExceptionInfo
    ///             {
    ///                 ExceptionType = &quot;string&quot;,
    ///                 ExceptionMessage = &quot;string&quot;,
    ///                 ExceptionStacktrace = &quot;string&quot;,
    ///             },
    ///             Stdout = &quot;string&quot;,
    ///         },
    ///         TraceResponses = new List&lt;TraceResponse&gt;()
    ///         {
    ///             new TraceResponse
    ///             {
    ///                 SubmissionId = &quot;d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32&quot;,
    ///                 LineNumber = 1,
    ///                 ReturnValue = 1,
    ///                 ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
    ///                 Stack = new StackInformation
    ///                 {
    ///                     NumStackFrames = 1,
    ///                     TopStackFrame = new StackFrame
    ///                     {
    ///                         MethodName = &quot;string&quot;,
    ///                         LineNumber = 1,
    ///                         Scopes = new List&lt;Scope&gt;()
    ///                         {
    ///                             new Scope { Variables = new Dictionary&lt;string, object&gt;() { } },
    ///                         },
    ///                     },
    ///                 },
    ///                 Stdout = &quot;string&quot;,
    ///             },
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task StoreTracedWorkspaceAsync(
        string submissionId,
        StoreTracedWorkspaceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"/admin/store-workspace-trace/submission/{submissionId}",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Admin.StoreTracedWorkspaceV2Async(
    ///     &quot;d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32&quot;,
    ///     new List&lt;TraceResponseV2&gt;()
    ///     {
    ///         new TraceResponseV2
    ///         {
    ///             SubmissionId = &quot;d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32&quot;,
    ///             LineNumber = 1,
    ///             File = new TracedFile { Filename = &quot;string&quot;, Directory = &quot;string&quot; },
    ///             ReturnValue = 1,
    ///             ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
    ///             Stack = new StackInformation
    ///             {
    ///                 NumStackFrames = 1,
    ///                 TopStackFrame = new StackFrame
    ///                 {
    ///                     MethodName = &quot;string&quot;,
    ///                     LineNumber = 1,
    ///                     Scopes = new List&lt;Scope&gt;()
    ///                     {
    ///                         new Scope { Variables = new Dictionary&lt;string, object&gt;() { } },
    ///                     },
    ///                 },
    ///             },
    ///             Stdout = &quot;string&quot;,
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task StoreTracedWorkspaceV2Async(
        string submissionId,
        IEnumerable<TraceResponseV2> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"/admin/store-workspace-trace-v2/submission/{submissionId}",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
