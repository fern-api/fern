using System.Net.Http;

namespace <%= namespace%>;

/// <summary>
/// The request object to be sent for Form URL Encoded APIs.
/// </summary>
internal record FormRequest : BaseRequest
{
    internal object? Body { get; init; }

    internal override HttpContent? CreateContent()
    {
        if (Body is null)
        {
            return null;
        }

        var (encoding, charset, mediaType) = ParseContentTypeOrDefault(
            ContentType,
            Utf8NoBom,
            "application/x-www-form-urlencoded"
        );
        
        var content = new StringContent(
            FormUrlEncoder.EncodeAsForm(Body).ReadAsStringAsync().Result,
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