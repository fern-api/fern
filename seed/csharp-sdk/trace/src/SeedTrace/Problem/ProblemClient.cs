using System.Net.Http;
using System.Text.Json;
using System.Threading;
using global::System.Threading.Tasks;
using SeedTrace.Core;

namespace SeedTrace;

public partial class ProblemClient
{
    private RawClient _client;

    internal ProblemClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Creates a problem
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Problem.CreateProblemAsync(
    ///     new CreateProblemRequest
    ///     {
    ///         ProblemName = "problemName",
    ///         ProblemDescription = new ProblemDescription
    ///         {
    ///             Boards = new List&lt;object&gt;() { "boards", "boards" },
    ///         },
    ///         Files = new Dictionary&lt;Language, ProblemFiles&gt;()
    ///         {
    ///             {
    ///                 Language.Java,
    ///                 new ProblemFiles
    ///                 {
    ///                     SolutionFile = new FileInfo { Filename = "filename", Contents = "contents" },
    ///                     ReadOnlyFiles = new List&lt;FileInfo&gt;()
    ///                     {
    ///                         new FileInfo { Filename = "filename", Contents = "contents" },
    ///                         new FileInfo { Filename = "filename", Contents = "contents" },
    ///                     },
    ///                 }
    ///             },
    ///         },
    ///         InputParams = new List&lt;VariableTypeAndName&gt;()
    ///         {
    ///             new VariableTypeAndName { VariableType = "no-properties-union", Name = "name" },
    ///             new VariableTypeAndName { VariableType = "no-properties-union", Name = "name" },
    ///         },
    ///         OutputType = "no-properties-union",
    ///         Testcases = new List&lt;TestCaseWithExpectedResult&gt;()
    ///         {
    ///             new TestCaseWithExpectedResult
    ///             {
    ///                 TestCase = new TestCase
    ///                 {
    ///                     Id = "id",
    ///                     Params = new List&lt;object&gt;() { 1, 1 },
    ///                 },
    ///                 ExpectedResult = 1,
    ///             },
    ///             new TestCaseWithExpectedResult
    ///             {
    ///                 TestCase = new TestCase
    ///                 {
    ///                     Id = "id",
    ///                     Params = new List&lt;object&gt;() { 1, 1 },
    ///                 },
    ///                 ExpectedResult = 1,
    ///             },
    ///         },
    ///         MethodName = "methodName",
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<object> CreateProblemAsync(
        CreateProblemRequest request,
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
                    Path = "/problem-crud/create",
                    Body = request,
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
                return JsonUtils.Deserialize<object>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedTraceException("Failed to deserialize response", e);
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
    /// Updates a problem
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Problem.UpdateProblemAsync(
    ///     "problemId",
    ///     new CreateProblemRequest
    ///     {
    ///         ProblemName = "problemName",
    ///         ProblemDescription = new ProblemDescription
    ///         {
    ///             Boards = new List&lt;object&gt;() { "boards", "boards" },
    ///         },
    ///         Files = new Dictionary&lt;Language, ProblemFiles&gt;()
    ///         {
    ///             {
    ///                 Language.Java,
    ///                 new ProblemFiles
    ///                 {
    ///                     SolutionFile = new FileInfo { Filename = "filename", Contents = "contents" },
    ///                     ReadOnlyFiles = new List&lt;FileInfo&gt;()
    ///                     {
    ///                         new FileInfo { Filename = "filename", Contents = "contents" },
    ///                         new FileInfo { Filename = "filename", Contents = "contents" },
    ///                     },
    ///                 }
    ///             },
    ///         },
    ///         InputParams = new List&lt;VariableTypeAndName&gt;()
    ///         {
    ///             new VariableTypeAndName { VariableType = "no-properties-union", Name = "name" },
    ///             new VariableTypeAndName { VariableType = "no-properties-union", Name = "name" },
    ///         },
    ///         OutputType = "no-properties-union",
    ///         Testcases = new List&lt;TestCaseWithExpectedResult&gt;()
    ///         {
    ///             new TestCaseWithExpectedResult
    ///             {
    ///                 TestCase = new TestCase
    ///                 {
    ///                     Id = "id",
    ///                     Params = new List&lt;object&gt;() { 1, 1 },
    ///                 },
    ///                 ExpectedResult = 1,
    ///             },
    ///             new TestCaseWithExpectedResult
    ///             {
    ///                 TestCase = new TestCase
    ///                 {
    ///                     Id = "id",
    ///                     Params = new List&lt;object&gt;() { 1, 1 },
    ///                 },
    ///                 ExpectedResult = 1,
    ///             },
    ///         },
    ///         MethodName = "methodName",
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<UpdateProblemResponse> UpdateProblemAsync(
        string problemId,
        CreateProblemRequest request,
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
                    Path = $"/problem-crud/update/{JsonUtils.SerializeAsString(problemId)}",
                    Body = request,
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
                return JsonUtils.Deserialize<UpdateProblemResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedTraceException("Failed to deserialize response", e);
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
    /// Soft deletes a problem
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Problem.DeleteProblemAsync("problemId");
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task DeleteProblemAsync(
        string problemId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Delete,
                    Path = $"/problem-crud/delete/{JsonUtils.SerializeAsString(problemId)}",
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
    /// <example>
    /// <code>
    /// await client.Problem.GetDefaultStarterFilesAsync(
    ///     new GetDefaultStarterFilesRequest
    ///     {
    ///         InputParams = new List&lt;VariableTypeAndName&gt;()
    ///         {
    ///             new VariableTypeAndName { VariableType = "no-properties-union", Name = "name" },
    ///             new VariableTypeAndName { VariableType = "no-properties-union", Name = "name" },
    ///         },
    ///         OutputType = "no-properties-union",
    ///         MethodName = "methodName",
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<GetDefaultStarterFilesResponse> GetDefaultStarterFilesAsync(
        GetDefaultStarterFilesRequest request,
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
                    Path = "/problem-crud/default-starter-files",
                    Body = request,
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
                return JsonUtils.Deserialize<GetDefaultStarterFilesResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedTraceException("Failed to deserialize response", e);
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
}
