using System.Net.Http;

namespace SeedBearerTokenEnvironmentVariable.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
