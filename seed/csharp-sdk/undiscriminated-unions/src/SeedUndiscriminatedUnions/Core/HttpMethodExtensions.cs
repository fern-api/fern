using System.Net.Http;

namespace SeedUndiscriminatedUnions.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
