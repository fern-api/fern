using System.Net.Http;

namespace SeedInferredAuthImplicitApiKey.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
