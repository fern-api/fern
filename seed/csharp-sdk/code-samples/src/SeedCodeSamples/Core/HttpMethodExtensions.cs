using System.Net.Http;

namespace SeedCodeSamples.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
