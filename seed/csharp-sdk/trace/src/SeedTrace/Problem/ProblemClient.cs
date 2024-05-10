using System.Text.Json;
using SeedTrace;

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
    public async CreateProblemResponse CreateProblemAsync(CreateProblemRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/create",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<CreateProblemResponse>(responseBody);
        }
        throw new Exception();
    }

    /// <summary>
    /// Updates a problem
    /// </summary>
    public async UpdateProblemResponse UpdateProblemAsync(
        string problemId,
        CreateProblemRequest request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/update/{problemId}",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<UpdateProblemResponse>(responseBody);
        }
        throw new Exception();
    }

    /// <summary>
    /// Soft deletes a problem
    /// </summary>
    public async void DeleteProblemAsync(string problemId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Delete, Path = $"/delete/{problemId}" }
        );
    }

    /// <summary>
    /// Returns default starter files for problem
    /// </summary>
    public async GetDefaultStarterFilesResponse GetDefaultStarterFilesAsync(
        GetDefaultStarterFilesRequest request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Post, Path = "/default-starter-files" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<GetDefaultStarterFilesResponse>(responseBody);
        }
        throw new Exception();
    }
}
