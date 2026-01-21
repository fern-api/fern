using System.Net;

namespace SeedAnyAuth.Core;

/// <summary>
/// Contains HTTP response metadata including status code, URL, and headers.
/// </summary>
public record RawResponse
{
    /// <summary>
    /// The HTTP status code of the response.
    /// </summary>
    public required HttpStatusCode StatusCode { get; init; }

    /// <summary>
    /// The request URL that generated this response.
    /// </summary>
    public required Uri Url { get; init; }

    /// <summary>
    /// The HTTP response headers.
    /// </summary>
    public required Core.ResponseHeaders Headers { get; init; }
}
