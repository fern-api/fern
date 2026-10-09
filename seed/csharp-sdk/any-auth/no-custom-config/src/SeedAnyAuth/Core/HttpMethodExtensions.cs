using global::System.Net.Http;

namespace SeedAnyAuth.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
