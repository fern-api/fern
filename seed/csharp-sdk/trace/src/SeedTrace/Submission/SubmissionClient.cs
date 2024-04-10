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
    public async void CreateExecutionSessionAsync() { }

    /// <summary>
    /// Returns execution server URL for session. Returns empty if session isn't registered.
    /// </summary>
    public async void GetExecutionSessionAsync() { }

    /// <summary>
    /// Stops execution session.
    /// </summary>
    public async void StopExecutionSessionAsync() { }

    public async void GetExecutionSessionsStateAsync() { }
}
