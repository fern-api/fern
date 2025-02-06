using System.Net.Http;

namespace SeedApiWideBasePath.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
