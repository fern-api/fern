using System.Net.Http;

namespace SeedWebsocketParameterName.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
