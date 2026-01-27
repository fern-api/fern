using global::System.Net.Http;

namespace SeedPublicObject.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
