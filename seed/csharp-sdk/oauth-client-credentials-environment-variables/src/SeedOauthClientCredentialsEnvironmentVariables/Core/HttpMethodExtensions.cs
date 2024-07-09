using System.Net.Http;

namespace SeedOauthClientCredentialsEnvironmentVariables.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
