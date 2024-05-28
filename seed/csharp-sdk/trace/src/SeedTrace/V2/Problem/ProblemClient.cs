using System.Text.Json;
using SeedTrace;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public class ProblemClient
{
    private RawClient _client;

    public ProblemClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Returns lightweight versions of all problems
    /// </summary>
    public async Task<List<LightweightProblemInfoV2>> GetLightweightProblemsAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = "/lightweight-problem-info" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<LightweightProblemInfoV2>>(responseBody);
        }
        throw new Exception();
    }

    /// <summary>
    /// Returns latest versions of all problems
    /// </summary>
    public async Task<List<ProblemInfoV2>> GetProblemsAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = "/problem-info" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<ProblemInfoV2>>(responseBody);
        }
        throw new Exception();
    }

    /// <summary>
    /// Returns latest version of a problem
    /// </summary>
    public async Task<ProblemInfoV2> GetLatestProblemAsync(string problemId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Get,
                Path = $"/problem-info/{problemId}"
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ProblemInfoV2>(responseBody);
        }
        throw new Exception();
    }

    /// <summary>
    /// Returns requested version of a problem
    /// </summary>
    public async Task<ProblemInfoV2> GetProblemVersionAsync(string problemId, int problemVersion)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Get,
                Path = $"/problem-info/{problemId}/version/{problemVersion}"
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ProblemInfoV2>(responseBody);
        }
        throw new Exception();
    }
}
