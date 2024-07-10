using System.Net.Http;

namespace SeedCodeSamples.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
