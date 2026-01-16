using System.Net;

namespace SeedApiWideBasePath;

/// <summary>
/// Contains HTTP response metadata (status code, URL, headers) without the parsed body.
/// </summary>
public record RawResponse
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
}
