using System.Net.Http;

namespace SeedPathParameters.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
