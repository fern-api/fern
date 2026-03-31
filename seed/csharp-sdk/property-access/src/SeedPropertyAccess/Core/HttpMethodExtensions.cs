using global::System.Net.Http;

namespace SeedPropertyAccess.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
