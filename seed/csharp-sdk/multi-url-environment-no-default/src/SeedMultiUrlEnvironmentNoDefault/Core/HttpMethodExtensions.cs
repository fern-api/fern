using System.Net.Http;

namespace SeedMultiUrlEnvironmentNoDefault.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
