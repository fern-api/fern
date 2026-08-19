namespace SeedAudiences;

/// <summary>
/// Wraps a parsed response value with its raw HTTP response metadata.
/// </summary>
/// <typeparam name="T">The type of the parsed response data.</typeparam>
public readonly struct WithRawResponse<T>
{
    /// <summary>
    /// The parsed response data.
    /// </summary>
    public required T Data { get; init; }

    /// <summary>
    /// The raw HTTP response metadata.
    /// </summary>
    public required RawResponse RawResponse { get; init; }
}
