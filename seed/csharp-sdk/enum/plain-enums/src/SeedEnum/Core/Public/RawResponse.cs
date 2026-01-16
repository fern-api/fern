using System.Net;

namespace SeedEnum;

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
    /// Header names are case-insensitive.
    /// </summary>
    public required IReadOnlyDictionary<string, IEnumerable<string>> Headers { get; init; }

    /// <summary>
    /// The deserialized response body.
    /// </summary>
    public required T Body { get; init; }
}
