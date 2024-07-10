using System.Net.Http;

namespace SeedCustomAuth.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
