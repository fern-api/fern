using System.Net.Http;

namespace SeedLiteral.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
