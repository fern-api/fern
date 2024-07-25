using System.Net.Http;
using SeedTrace.Core;
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
    public async Task<IEnumerable<LightweightProblemInfoV2>> GetLightweightProblemsAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/problems-v2/lightweight-problem-info"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<IEnumerable<LightweightProblemInfoV2>>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Returns latest versions of all problems
    /// </summary>
    public async Task<IEnumerable<ProblemInfoV2>> GetProblemsAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/problems-v2/problem-info"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<IEnumerable<ProblemInfoV2>>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Returns latest version of a problem
    /// </summary>
    public async Task<ProblemInfoV2> GetLatestProblemAsync(string problemId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/problems-v2/problem-info/{problemId}"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ProblemInfoV2>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Returns requested version of a problem
    /// </summary>
    public async Task<ProblemInfoV2> GetProblemVersionAsync(string problemId, int problemVersion)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/problems-v2/problem-info/{problemId}/version/{problemVersion}"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ProblemInfoV2>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
