using global::System.Net.Http;

namespace SeedCsharpOauthTokenOptional.Core;

/// <summary>
/// The request object to send without a request body.
/// </summary>
internal record EmptyRequest : BaseRequest
{
    internal override HttpContent? CreateContent() => null;
}
