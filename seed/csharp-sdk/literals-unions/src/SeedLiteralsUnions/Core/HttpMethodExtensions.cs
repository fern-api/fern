using System.Net.Http;

namespace SeedLiteralsUnions.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
