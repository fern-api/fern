using System.Net.Http;

namespace SeedUnions.Core;

/// <summary>
/// The request object to be sent for JSON APIs.
/// </summary>
internal record JsonRequest : BaseRequest
{
    internal object? Body { get; init; }

    internal override HttpContent? CreateContent()
    {
        if (Body is null && Options?.AdditionalBodyProperties is null)
        {
            return null;
        }

        var (encoding, charset, mediaType) = ParseContentTypeOrDefault(
            ContentType,
            Utf8NoBom,
            "application/json"
        );
        var content = new StringContent(
            JsonUtils.SerializeWithAdditionalProperties(Body, Options?.AdditionalBodyProperties),
            encoding,
            mediaType
        );
        if (string.IsNullOrEmpty(charset) && content.Headers.ContentType is not null)
        {
            content.Headers.ContentType.CharSet = "";
        }

        return content;
    }
}
