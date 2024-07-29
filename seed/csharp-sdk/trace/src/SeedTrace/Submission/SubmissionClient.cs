using System.Net.Http;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class SubmissionClient
{
    private RawClient _client;

    public SubmissionClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Returns sessionId and execution server URL for session. Spins up server.
    /// </summary>
    public async Task<ExecutionSessionResponse> CreateExecutionSessionAsync(Language language)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"/sessions/create-session/{language}"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ExecutionSessionResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Returns execution server URL for session. Returns empty if session isn't registered.
    /// </summary>
    public async Task<ExecutionSessionResponse?> GetExecutionSessionAsync(string sessionId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/sessions/{sessionId}"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ExecutionSessionResponse?>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Stops execution session.
    /// </summary>
    public async Task StopExecutionSessionAsync(string sessionId)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Delete,
                Path = $"/sessions/stop/{sessionId}"
            }
        );
    }

    public async Task<GetExecutionSessionStateResponse> GetExecutionSessionsStateAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/sessions/execution-sessions-state"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<GetExecutionSessionStateResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
