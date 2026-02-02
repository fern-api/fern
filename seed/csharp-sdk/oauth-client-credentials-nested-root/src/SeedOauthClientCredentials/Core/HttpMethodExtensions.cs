using global::System.Net.Http;

namespace SeedOauthClientCredentials.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
