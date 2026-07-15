using global::System.Net.Http;

namespace SeedCsharpUnionBaseProperties.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
