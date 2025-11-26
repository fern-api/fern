using global::System.Net;
using global::System.Net.Http.Headers;

namespace SeedHttpHead;

/// <summary>
/// Represents an API response with the deserialized body and HTTP metadata.
/// </summary>
/// <typeparam name="T">The type of the response body.</typeparam>
public record RawResponse<T>
{
    /// <summary>
    /// The deserialized response body.
    /// </summary>
    public required T Body { get; init; }

    /// <summary>
    /// The HTTP status code of the response.
    /// </summary>
    public required int StatusCode { get; init; }

    /// <summary>
    /// The HTTP response headers.
    /// </summary>
    public required HttpResponseHeaders Headers { get; init; }
}
