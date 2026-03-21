using global::System.Net.Http;

namespace SeedWebsocketOauth.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
