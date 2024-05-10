using System.Text.Json;
using SeedTrace;

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
    public async ExecutionSessionResponse CreateExecutionSessionAsync(Language language)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/create-session/{language}"
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ExecutionSessionResponse>(responseBody);
        }
        throw new Exception();
    }

    /// <summary>
    /// Returns execution server URL for session. Returns empty if session isn't registered.
    /// </summary>
    public async List<ExecutionSessionResponse?> GetExecutionSessionAsync(string sessionId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = $"/{sessionId}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<ExecutionSessionResponse?>>(responseBody);
        }
        throw new Exception();
    }

    /// <summary>
    /// Stops execution session.
    /// </summary>
    public async void StopExecutionSessionAsync(string sessionId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Delete, Path = $"/stop/{sessionId}" }
        );
    }

    public async GetExecutionSessionStateResponse GetExecutionSessionsStateAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = "/execution-sessions-state" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<GetExecutionSessionStateResponse>(responseBody);
        }
        throw new Exception();
    }
}
