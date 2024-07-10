using System.Net.Http;

namespace SeedAudiences.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
