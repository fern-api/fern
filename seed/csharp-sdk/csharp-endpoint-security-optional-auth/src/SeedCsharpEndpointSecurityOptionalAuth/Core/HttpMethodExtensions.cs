using global::System.Net.Http;

namespace SeedCsharpEndpointSecurityOptionalAuth.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
