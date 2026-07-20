using global::System.Net.Http;

namespace SeedPhpGlobalHeaderEnv.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
