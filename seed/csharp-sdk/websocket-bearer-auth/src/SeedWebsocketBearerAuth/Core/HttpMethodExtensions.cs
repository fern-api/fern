using System.Net.Http;

namespace SeedWebsocketBearerAuth.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
