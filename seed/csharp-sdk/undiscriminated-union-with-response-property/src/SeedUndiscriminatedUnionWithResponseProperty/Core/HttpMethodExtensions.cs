using System.Net.Http;

namespace SeedUndiscriminatedUnionWithResponseProperty.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
