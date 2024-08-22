using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedTrace.Core;

#nullable enable

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
    ///         ProblemName = "string",
    ///         ProblemDescription = new ProblemDescription { Boards = new List<object>() { "string" } },
    ///         Files = new Dictionary<Language, ProblemFiles>()
    ///         {
    ///             {
    ///                 Language.Java,
    ///                 new ProblemFiles
    ///                 {
    ///                     SolutionFile = new FileInfo { Filename = "string", Contents = "string" },
    ///                     ReadOnlyFiles = new List<FileInfo>()
    ///                     {
    ///                         new FileInfo { Filename = "string", Contents = "string" },
    ///                     },
    ///                 }
    ///             },
    ///         },
    ///         InputParams = new List<VariableTypeAndName>()
    ///         {
    ///             new VariableTypeAndName { VariableType = "no-properties-union", Name = "string" },
    ///         },
    ///         OutputType = "no-properties-union",
    ///         Testcases = new List<TestCaseWithExpectedResult>()
    ///         {
    ///             new TestCaseWithExpectedResult
    ///             {
    ///                 TestCase = new TestCase
    ///                 {
    ///                     Id = "string",
    ///                     Params = new List<object>() { 1 },
    ///                 },
    ///                 ExpectedResult = 1,
    ///             },
    ///         },
    ///         MethodName = "string",
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
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/problem-crud/create",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<object>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedTraceException("Failed to deserialize response", e);
            }
        }

        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <summary>
    /// Updates a problem
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Problem.UpdateProblemAsync(
    ///     "string",
    ///     new CreateProblemRequest
    ///     {
    ///         ProblemName = "string",
    ///         ProblemDescription = new ProblemDescription { Boards = new List<object>() { "string" } },
    ///         Files = new Dictionary<Language, ProblemFiles>()
    ///         {
    ///             {
    ///                 Language.Java,
    ///                 new ProblemFiles
    ///                 {
    ///                     SolutionFile = new FileInfo { Filename = "string", Contents = "string" },
    ///                     ReadOnlyFiles = new List<FileInfo>()
    ///                     {
    ///                         new FileInfo { Filename = "string", Contents = "string" },
    ///                     },
    ///                 }
    ///             },
    ///         },
    ///         InputParams = new List<VariableTypeAndName>()
    ///         {
    ///             new VariableTypeAndName { VariableType = "no-properties-union", Name = "string" },
    ///         },
    ///         OutputType = "no-properties-union",
    ///         Testcases = new List<TestCaseWithExpectedResult>()
    ///         {
    ///             new TestCaseWithExpectedResult
    ///             {
    ///                 TestCase = new TestCase
    ///                 {
    ///                     Id = "string",
    ///                     Params = new List<object>() { 1 },
    ///                 },
    ///                 ExpectedResult = 1,
    ///             },
    ///         },
    ///         MethodName = "string",
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
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"/problem-crud/update/{problemId}",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<UpdateProblemResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedTraceException("Failed to deserialize response", e);
            }
        }

        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <summary>
    /// Soft deletes a problem
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Problem.DeleteProblemAsync("string");
    /// </code>
    /// </example>
    public async Task DeleteProblemAsync(
        string problemId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Delete,
                Path = $"/problem-crud/delete/{problemId}",
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

    /// <summary>
    /// Returns default starter files for problem
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Problem.GetDefaultStarterFilesAsync(
    ///     new GetDefaultStarterFilesRequest
    ///     {
    ///         InputParams = new List<VariableTypeAndName>()
    ///         {
    ///             new VariableTypeAndName { VariableType = "no-properties-union", Name = "string" },
    ///         },
    ///         OutputType = "no-properties-union",
    ///         MethodName = "string",
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
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/problem-crud/default-starter-files",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<GetDefaultStarterFilesResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedTraceException("Failed to deserialize response", e);
            }
        }

        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
