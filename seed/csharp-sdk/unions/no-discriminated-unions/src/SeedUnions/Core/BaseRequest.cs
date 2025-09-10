using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace SeedUnions.Core;

internal abstract record BaseRequest
{
    internal required string BaseUrl { get; init; }

    internal required HttpMethod Method { get; init; }

    internal required string Path { get; init; }

    internal string? ContentType { get; init; }

    internal Dictionary<string, object> Query { get; init; } = new();

    internal Headers Headers { get; init; } = new();

    internal IRequestOptions? Options { get; init; }

    internal abstract HttpContent? CreateContent();

    protected static (
        Encoding encoding,
        string? charset,
        string mediaType
    ) ParseContentTypeOrDefault(
        string? contentType,
        Encoding encodingFallback,
        string mediaTypeFallback
    )
    {
        var encoding = encodingFallback;
        var mediaType = mediaTypeFallback;
        string? charset = null;
        if (string.IsNullOrEmpty(contentType))
        {
            return (encoding, charset, mediaType);
        }

        if (!MediaTypeHeaderValue.TryParse(contentType, out var mediaTypeHeaderValue))
        {
            return (encoding, charset, mediaType);
        }

        if (!string.IsNullOrEmpty(mediaTypeHeaderValue.CharSet))
        {
            charset = mediaTypeHeaderValue.CharSet;
            encoding = Encoding.GetEncoding(mediaTypeHeaderValue.CharSet);
        }

        if (!string.IsNullOrEmpty(mediaTypeHeaderValue.MediaType))
        {
            mediaType = mediaTypeHeaderValue.MediaType;
        }

        return (encoding, charset, mediaType);
    }

    protected static Encoding Utf8NoBom => EncodingCache.Utf8NoBom;
}
