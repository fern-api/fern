using System.Net.Http;

namespace SeedInferredAuthImplicit.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
