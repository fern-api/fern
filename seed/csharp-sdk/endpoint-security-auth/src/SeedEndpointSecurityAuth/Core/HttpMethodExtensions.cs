using global::System.Net.Http;

namespace SeedEndpointSecurityAuth.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
