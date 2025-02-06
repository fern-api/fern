using System.Net.Http;

namespace SeedIdempotencyHeaders.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
