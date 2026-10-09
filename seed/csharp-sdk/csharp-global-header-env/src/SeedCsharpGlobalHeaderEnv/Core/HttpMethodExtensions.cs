using global::System.Net.Http;

namespace SeedCsharpGlobalHeaderEnv.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
