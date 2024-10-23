using System.Net.Http;

namespace SeedAuthEnvironmentVariables.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
