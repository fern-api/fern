using System.Net.Http;

namespace SeedOauthClientCredentialsMandatoryAuth.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
