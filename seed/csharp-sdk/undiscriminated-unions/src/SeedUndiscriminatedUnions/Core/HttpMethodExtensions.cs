using System.Net.Http;

namespace SeedUndiscriminatedUnions.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
