using System.Net.Http;

namespace SeedContentTypes.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
