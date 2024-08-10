using System.Net.Http;

namespace SeedBasicAuthEnvironmentVariables.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
