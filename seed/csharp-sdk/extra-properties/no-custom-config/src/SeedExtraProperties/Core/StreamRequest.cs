using global::System.Net.Http;
using global::System.Net.Http.Headers;

namespace SeedExtraProperties.Core;

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
