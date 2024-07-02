using System.Text.Json;
using SeedTrace;

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
                Method = HttpMethod.Post,
                Path = $"/sessions/create-session/{language}"
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ExecutionSessionResponse>(responseBody);
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
                Method = HttpMethod.Get,
                Path = $"/sessions/{sessionId}"
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ExecutionSessionResponse?>(responseBody);
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Stops execution session.
    /// </summary>
    public async void StopExecutionSessionAsync(string sessionId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
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
                Method = HttpMethod.Get,
                Path = "/sessions/execution-sessions-state"
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<GetExecutionSessionStateResponse>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
