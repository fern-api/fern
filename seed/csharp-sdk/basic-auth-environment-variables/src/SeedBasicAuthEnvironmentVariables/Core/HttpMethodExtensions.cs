using System.Net.Http;

namespace SeedBasicAuthEnvironmentVariables.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
