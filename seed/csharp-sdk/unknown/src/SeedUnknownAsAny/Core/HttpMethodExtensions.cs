using global::System.Net.Http;

namespace SeedUnknownAsAny.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
