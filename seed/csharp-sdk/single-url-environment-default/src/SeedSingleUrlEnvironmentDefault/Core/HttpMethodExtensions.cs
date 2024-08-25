using System.Net.Http;

namespace SeedSingleUrlEnvironmentDefault.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
