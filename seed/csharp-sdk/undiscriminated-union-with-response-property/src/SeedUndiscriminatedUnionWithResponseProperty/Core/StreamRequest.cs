using System.Net.Http;
using System.Net.Http.Headers;

namespace SeedUndiscriminatedUnionWithResponseProperty.Core;

/// <summary>
/// The request object to be sent for streaming uploads.
/// </summary>
internal record StreamRequest : BaseRequest
{
    internal Stream? Body { get; init; }

    internal override HttpContent? CreateContent()
    {
        if (Body is null)
        {
            return null;
        }

        var content = new StreamContent(Body)
        {
            Headers =
            {
                ContentType = MediaTypeHeaderValue.Parse(ContentType ?? "application/octet-stream"),
            },
        };
        return content;
    }
}
