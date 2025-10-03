using System.Net.Http;

namespace SeedApi.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
