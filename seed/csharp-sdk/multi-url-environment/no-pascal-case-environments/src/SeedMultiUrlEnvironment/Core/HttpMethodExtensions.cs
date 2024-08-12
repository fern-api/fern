using System.Net.Http;

namespace SeedMultiUrlEnvironment.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
