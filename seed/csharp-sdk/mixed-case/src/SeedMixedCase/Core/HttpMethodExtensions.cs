using System.Net.Http;

namespace SeedMixedCase.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
