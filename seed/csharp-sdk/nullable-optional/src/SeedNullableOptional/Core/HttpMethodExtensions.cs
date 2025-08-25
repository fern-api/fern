using System.Net.Http;

namespace SeedNullableOptional.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
