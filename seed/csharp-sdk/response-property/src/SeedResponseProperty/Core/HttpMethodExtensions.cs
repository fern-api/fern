using System.Net.Http;

namespace SeedResponseProperty.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
