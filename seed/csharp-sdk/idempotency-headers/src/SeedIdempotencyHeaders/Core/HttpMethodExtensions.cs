using System.Net.Http;

namespace SeedIdempotencyHeaders.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
