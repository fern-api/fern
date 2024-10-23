using System.Net.Http;

namespace SeedErrorProperty.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
