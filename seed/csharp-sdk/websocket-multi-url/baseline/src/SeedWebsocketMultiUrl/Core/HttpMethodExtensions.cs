using global::System.Net.Http;

namespace SeedWebsocketMultiUrl.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
