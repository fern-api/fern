using System.Net.Http;

namespace SeedBearerTokenEnvironmentVariable.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
