using System.Net.Http;

namespace SeedObject.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
