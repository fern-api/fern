using System.Text.Json;
using SeedTrace.Core;

namespace SeedTrace;

public partial class ProblemClient : IProblemClient
{
    private RawClient _client;

    internal ProblemClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<CreateProblemResponse>> CreateProblemAsyncCore(
        CreateProblemRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedTrace.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/problem-crud/create",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                var responseData = JsonUtils.Deserialize<CreateProblemResponse>(responseBody)!;
                return new WithRawResponse<CreateProblemResponse>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedTraceApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
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

    private async Task<WithRawResponse<UpdateProblemResponse>> UpdateProblemAsyncCore(
        string problemId,
        CreateProblemRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedTrace.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/problem-crud/update/{0}",
                        ValueConvert.ToPathParameterString(problemId)
                    ),
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                var responseData = JsonUtils.Deserialize<UpdateProblemResponse>(responseBody)!;
                return new WithRawResponse<UpdateProblemResponse>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedTraceApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
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

    private async Task<
        WithRawResponse<GetDefaultStarterFilesResponse>
    > GetDefaultStarterFilesAsyncCore(
        GetDefaultStarterFilesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedTrace.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/problem-crud/default-starter-files",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                var responseData = JsonUtils.Deserialize<GetDefaultStarterFilesResponse>(
                    responseBody
                )!;
                return new WithRawResponse<GetDefaultStarterFilesResponse>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedTraceApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
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

    /// <summary>
    /// Creates a problem
    /// </summary>
    /// <example><code>
    /// await client.Problem.CreateProblemAsync(
    ///     new CreateProblemRequest
    ///     {
    ///         ProblemName = "problemName",
    ///         ProblemDescription = new ProblemDescription
    ///         {
    ///             Boards = new List&lt;ProblemDescriptionBoard&gt;()
    ///             {
    ///                 new ProblemDescriptionBoard(new ProblemDescriptionBoard.Html("boards")),
    ///                 new ProblemDescriptionBoard(new ProblemDescriptionBoard.Html("boards")),
    ///             },
    ///         },
    ///         Files = new Dictionary&lt;Language, ProblemFiles&gt;()
    ///         {
    ///             {
    ///                 Language.Java,
    ///                 new ProblemFiles
    ///                 {
    ///                     SolutionFile = new SeedTrace.FileInfo
    ///                     {
    ///                         Filename = "filename",
    ///                         Contents = "contents",
    ///                     },
    ///                     ReadOnlyFiles = new List&lt;SeedTrace.FileInfo&gt;()
    ///                     {
    ///                         new SeedTrace.FileInfo { Filename = "filename", Contents = "contents" },
    ///                         new SeedTrace.FileInfo { Filename = "filename", Contents = "contents" },
    ///                     },
    ///                 }
    ///             },
    ///         },
    ///         InputParams = new List&lt;VariableTypeAndName&gt;()
    ///         {
    ///             new VariableTypeAndName
    ///             {
    ///                 VariableType = new VariableType(new VariableType.IntegerType()),
    ///                 Name = "name",
    ///             },
    ///             new VariableTypeAndName
    ///             {
    ///                 VariableType = new VariableType(new VariableType.IntegerType()),
    ///                 Name = "name",
    ///             },
    ///         },
    ///         OutputType = new VariableType(new VariableType.IntegerType()),
    ///         Testcases = new List&lt;TestCaseWithExpectedResult&gt;()
    ///         {
    ///             new TestCaseWithExpectedResult
    ///             {
    ///                 TestCase = new TestCase
    ///                 {
    ///                     Id = "id",
    ///                     Params = new List&lt;VariableValue&gt;()
    ///                     {
    ///                         new VariableValue(new VariableValue.IntegerValue(1)),
    ///                         new VariableValue(new VariableValue.IntegerValue(1)),
    ///                     },
    ///                 },
    ///                 ExpectedResult = new VariableValue(new VariableValue.IntegerValue(1)),
    ///             },
    ///             new TestCaseWithExpectedResult
    ///             {
    ///                 TestCase = new TestCase
    ///                 {
    ///                     Id = "id",
    ///                     Params = new List&lt;VariableValue&gt;()
    ///                     {
    ///                         new VariableValue(new VariableValue.IntegerValue(1)),
    ///                         new VariableValue(new VariableValue.IntegerValue(1)),
    ///                     },
    ///                 },
    ///                 ExpectedResult = new VariableValue(new VariableValue.IntegerValue(1)),
    ///             },
    ///         },
    ///         MethodName = "methodName",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<CreateProblemResponse> CreateProblemAsync(
        CreateProblemRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<CreateProblemResponse>(
            CreateProblemAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Updates a problem
    /// </summary>
    /// <example><code>
    /// await client.Problem.UpdateProblemAsync(
    ///     "problemId",
    ///     new CreateProblemRequest
    ///     {
    ///         ProblemName = "problemName",
    ///         ProblemDescription = new ProblemDescription
    ///         {
    ///             Boards = new List&lt;ProblemDescriptionBoard&gt;()
    ///             {
    ///                 new ProblemDescriptionBoard(new ProblemDescriptionBoard.Html("boards")),
    ///                 new ProblemDescriptionBoard(new ProblemDescriptionBoard.Html("boards")),
    ///             },
    ///         },
    ///         Files = new Dictionary&lt;Language, ProblemFiles&gt;()
    ///         {
    ///             {
    ///                 Language.Java,
    ///                 new ProblemFiles
    ///                 {
    ///                     SolutionFile = new SeedTrace.FileInfo
    ///                     {
    ///                         Filename = "filename",
    ///                         Contents = "contents",
    ///                     },
    ///                     ReadOnlyFiles = new List&lt;SeedTrace.FileInfo&gt;()
    ///                     {
    ///                         new SeedTrace.FileInfo { Filename = "filename", Contents = "contents" },
    ///                         new SeedTrace.FileInfo { Filename = "filename", Contents = "contents" },
    ///                     },
    ///                 }
    ///             },
    ///         },
    ///         InputParams = new List&lt;VariableTypeAndName&gt;()
    ///         {
    ///             new VariableTypeAndName
    ///             {
    ///                 VariableType = new VariableType(new VariableType.IntegerType()),
    ///                 Name = "name",
    ///             },
    ///             new VariableTypeAndName
    ///             {
    ///                 VariableType = new VariableType(new VariableType.IntegerType()),
    ///                 Name = "name",
    ///             },
    ///         },
    ///         OutputType = new VariableType(new VariableType.IntegerType()),
    ///         Testcases = new List&lt;TestCaseWithExpectedResult&gt;()
    ///         {
    ///             new TestCaseWithExpectedResult
    ///             {
    ///                 TestCase = new TestCase
    ///                 {
    ///                     Id = "id",
    ///                     Params = new List&lt;VariableValue&gt;()
    ///                     {
    ///                         new VariableValue(new VariableValue.IntegerValue(1)),
    ///                         new VariableValue(new VariableValue.IntegerValue(1)),
    ///                     },
    ///                 },
    ///                 ExpectedResult = new VariableValue(new VariableValue.IntegerValue(1)),
    ///             },
    ///             new TestCaseWithExpectedResult
    ///             {
    ///                 TestCase = new TestCase
    ///                 {
    ///                     Id = "id",
    ///                     Params = new List&lt;VariableValue&gt;()
    ///                     {
    ///                         new VariableValue(new VariableValue.IntegerValue(1)),
    ///                         new VariableValue(new VariableValue.IntegerValue(1)),
    ///                     },
    ///                 },
    ///                 ExpectedResult = new VariableValue(new VariableValue.IntegerValue(1)),
    ///             },
    ///         },
    ///         MethodName = "methodName",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<UpdateProblemResponse> UpdateProblemAsync(
        string problemId,
        CreateProblemRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UpdateProblemResponse>(
            UpdateProblemAsyncCore(problemId, request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Soft deletes a problem
    /// </summary>
    /// <example><code>
    /// await client.Problem.DeleteProblemAsync("problemId");
    /// </code></example>
    public async Task DeleteProblemAsync(
        string problemId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedTrace.Core.HeadersBuilder.Builder()
            .AddWithoutAuth(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Delete,
                    Path = string.Format(
                        "/problem-crud/delete/{0}",
                        ValueConvert.ToPathParameterString(problemId)
                    ),
                    Headers = _headers,
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

    /// <summary>
    /// Returns default starter files for problem
    /// </summary>
    /// <example><code>
    /// await client.Problem.GetDefaultStarterFilesAsync(
    ///     new GetDefaultStarterFilesRequest
    ///     {
    ///         InputParams = new List&lt;VariableTypeAndName&gt;()
    ///         {
    ///             new VariableTypeAndName
    ///             {
    ///                 VariableType = new VariableType(new VariableType.IntegerType()),
    ///                 Name = "name",
    ///             },
    ///             new VariableTypeAndName
    ///             {
    ///                 VariableType = new VariableType(new VariableType.IntegerType()),
    ///                 Name = "name",
    ///             },
    ///         },
    ///         OutputType = new VariableType(new VariableType.IntegerType()),
    ///         MethodName = "methodName",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<GetDefaultStarterFilesResponse> GetDefaultStarterFilesAsync(
        GetDefaultStarterFilesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<GetDefaultStarterFilesResponse>(
            GetDefaultStarterFilesAsyncCore(request, options, cancellationToken)
        );
    }
}
