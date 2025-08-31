using System.Net.Http;

namespace SeedWebsocketAuth.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
