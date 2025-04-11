using System.Net.Http;

namespace SeedExtraProperties.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
