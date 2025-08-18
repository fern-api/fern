using System.Net.Http;

namespace SeedInferredAuthExplicit.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
