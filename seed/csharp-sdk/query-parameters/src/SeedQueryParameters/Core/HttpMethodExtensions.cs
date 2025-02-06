using System.Net.Http;

namespace SeedQueryParameters.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
