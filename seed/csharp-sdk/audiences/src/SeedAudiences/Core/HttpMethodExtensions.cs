using System.Net.Http;

namespace SeedAudiences.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
