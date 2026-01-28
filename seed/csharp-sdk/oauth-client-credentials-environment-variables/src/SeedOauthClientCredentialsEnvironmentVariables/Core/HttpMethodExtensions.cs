using global::System.Net.Http;

namespace SeedOauthClientCredentialsEnvironmentVariables.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
