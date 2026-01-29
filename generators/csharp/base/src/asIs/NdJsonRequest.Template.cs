using global::System.Net.Http;

namespace <%= namespace%>;

/// <summary>
/// The request object to be sent for Newline Delimited JSON APIs.
/// </summary>
internal record NdJsonRequest : BaseRequest
{
    internal required object? Body { private get; init; }

    internal override HttpContent? CreateContent()
    {
        if (Body is null)
        {
            return null;
        }

        return new NdJsonContent(Body, ContentType, JsonOptions.JsonSerializerOptions);
    }
}
