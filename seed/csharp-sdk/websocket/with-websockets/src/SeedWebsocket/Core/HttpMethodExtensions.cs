using System.Net.Http;

namespace SeedWebsocket.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
