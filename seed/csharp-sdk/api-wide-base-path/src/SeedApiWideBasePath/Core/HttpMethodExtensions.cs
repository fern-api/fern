using System.Net.Http;

namespace SeedApiWideBasePath.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
