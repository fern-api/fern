using System.Net.Http;

namespace SeedLiteral.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
