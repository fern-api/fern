using System.Net.Http;

namespace SeedOauthClientCredentialsReference.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
