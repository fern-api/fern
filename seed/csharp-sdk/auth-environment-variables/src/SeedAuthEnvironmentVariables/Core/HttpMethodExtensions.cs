using System.Net.Http;

namespace SeedAuthEnvironmentVariables.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
