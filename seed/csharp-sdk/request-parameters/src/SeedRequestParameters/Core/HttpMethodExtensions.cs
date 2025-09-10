using System.Net.Http;

namespace SeedRequestParameters.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
