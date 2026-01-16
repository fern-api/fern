using System.Net;

namespace SeedInferredAuthImplicitNoExpiry;

/// <summary>
/// Wrapper containing HTTP response metadata and the parsed response body.
/// </summary>
/// <typeparam name="T">The type of the deserialized response body.</typeparam>
public record RawResponse<T>
{
    /// <summary>
    /// The HTTP status code of the response.
    /// </summary>
    public required HttpStatusCode StatusCode { get; init; }

    /// <summary>
    /// The final request URL.
    /// </summary>
    public required Uri Url { get; init; }

    /// <summary>
    /// The response headers, including both response headers and content headers.
    /// Provides typed access to common headers and case-insensitive header name lookups.
    /// </summary>
    public required ResponseHeaders Headers { get; init; }

    /// <summary>
    /// The deserialized response body.
    /// </summary>
    public required T Body { get; init; }
}
