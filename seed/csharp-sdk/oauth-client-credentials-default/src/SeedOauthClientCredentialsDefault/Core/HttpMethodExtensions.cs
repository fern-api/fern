using System.Net.Http;

namespace SeedOauthClientCredentialsDefault.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
