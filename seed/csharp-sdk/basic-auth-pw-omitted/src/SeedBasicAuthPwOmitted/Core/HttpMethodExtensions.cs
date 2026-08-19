using global::System.Net.Http;

namespace SeedBasicAuthPwOmitted.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
