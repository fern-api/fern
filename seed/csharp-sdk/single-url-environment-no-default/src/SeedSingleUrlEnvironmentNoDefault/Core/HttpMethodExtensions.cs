using System.Net.Http;

namespace SeedSingleUrlEnvironmentNoDefault.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
