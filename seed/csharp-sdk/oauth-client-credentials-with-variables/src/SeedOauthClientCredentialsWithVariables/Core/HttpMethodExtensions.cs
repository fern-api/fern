using System.Net.Http;

namespace SeedOauthClientCredentialsWithVariables.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
