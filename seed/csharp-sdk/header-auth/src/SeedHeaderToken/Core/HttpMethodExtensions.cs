using System.Net.Http;

namespace SeedHeaderToken.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
