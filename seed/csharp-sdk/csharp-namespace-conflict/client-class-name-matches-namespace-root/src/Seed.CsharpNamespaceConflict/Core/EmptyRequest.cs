using global::System.Net.Http;

namespace Seed.CsharpNamespaceConflict.Core;

/// <summary>
/// The request object to send without a request body.
/// </summary>
internal record EmptyRequest : BaseRequest
{
    internal override HttpContent? CreateContent() => null;
}
