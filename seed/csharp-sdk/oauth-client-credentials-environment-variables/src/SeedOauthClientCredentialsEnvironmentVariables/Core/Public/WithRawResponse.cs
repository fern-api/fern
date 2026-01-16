namespace SeedOauthClientCredentialsEnvironmentVariables;

/// <summary>
/// Wrapper containing the parsed response data and the raw HTTP response metadata.
/// </summary>
/// <typeparam name="T">The type of the deserialized response body.</typeparam>
public record WithRawResponse<T>
{
    /// <summary>
    /// The deserialized response data.
    /// </summary>
    public required T Data { get; init; }

    /// <summary>
    /// The raw HTTP response containing status code, URL, and headers.
    /// </summary>
    public required RawResponse RawResponse { get; init; }
}
