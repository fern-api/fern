using System.Net.Http;

namespace SeedBasicAuth.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
