using System.Net.Http;
using System.Text.Json;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class ProblemClient
{
    private RawClient _client;

    public ProblemClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Creates a problem
    /// </summary>
    public async Task<object> CreateProblemAsync(CreateProblemRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/problem-crud/create",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<object>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Updates a problem
    /// </summary>
    public async Task<UpdateProblemResponse> UpdateProblemAsync(
        string problemId,
        CreateProblemRequest request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/problem-crud/update/{problemId}",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<UpdateProblemResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Soft deletes a problem
    /// </summary>
    public async Task DeleteProblemAsync(string problemId)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Delete,
                Path = $"/problem-crud/delete/{problemId}"
            }
        );
    }

    /// <summary>
    /// Returns default starter files for problem
    /// </summary>
    public async Task<GetDefaultStarterFilesResponse> GetDefaultStarterFilesAsync(
        GetDefaultStarterFilesRequest request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/problem-crud/default-starter-files",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<GetDefaultStarterFilesResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
