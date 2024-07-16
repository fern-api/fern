using System.Net.Http;

namespace SeedOauthClientCredentials.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
