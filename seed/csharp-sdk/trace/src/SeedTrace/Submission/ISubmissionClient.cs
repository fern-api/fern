namespace SeedTrace;

public partial interface ISubmissionClient
{
    /// <summary>
    /// Returns sessionId and execution server URL for session. Spins up server.
    /// </summary>
    Task<ExecutionSessionResponse> CreateExecutionSessionAsync(
        Language language,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Returns execution server URL for session. Returns empty if session isn't registered.
    /// </summary>
    Task<ExecutionSessionResponse?> GetExecutionSessionAsync(
        string sessionId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Stops execution session.
    /// </summary>
    Task StopExecutionSessionAsync(
        string sessionId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<GetExecutionSessionStateResponse> GetExecutionSessionsStateAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
