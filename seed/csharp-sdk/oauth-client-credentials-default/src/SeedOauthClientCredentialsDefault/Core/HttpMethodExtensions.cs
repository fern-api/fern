using System.Net.Http;

namespace SeedOauthClientCredentialsDefault.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
