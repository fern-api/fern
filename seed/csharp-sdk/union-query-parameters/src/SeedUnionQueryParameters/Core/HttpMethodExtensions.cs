using global::System.Net.Http;

namespace SeedUnionQueryParameters.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
