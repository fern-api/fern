using System.Net.Http;

namespace SeedInferredAuthImplicitNoExpiry.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
