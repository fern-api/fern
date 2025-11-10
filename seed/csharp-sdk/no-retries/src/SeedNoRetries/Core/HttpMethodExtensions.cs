using System.Net.Http;

namespace SeedNoRetries.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
