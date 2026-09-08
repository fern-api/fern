using global::System.Net.Http;

namespace SeedCsharpOauthTokenRequiredGrantType.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
