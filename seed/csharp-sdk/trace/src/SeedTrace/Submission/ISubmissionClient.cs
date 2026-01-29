namespace SeedTrace;

public partial interface ISubmissionClient
{
    /// <summary>
    /// Returns sessionId and execution server URL for session. Spins up server.
    /// </summary>
    WithRawResponseTask<ExecutionSessionResponse> CreateExecutionSessionAsync(
        Language language,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Returns execution server URL for session. Returns empty if session isn't registered.
    /// </summary>
    WithRawResponseTask<ExecutionSessionResponse?> GetExecutionSessionAsync(
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

    WithRawResponseTask<GetExecutionSessionStateResponse> GetExecutionSessionsStateAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
