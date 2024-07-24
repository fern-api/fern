using System.Net.Http;

namespace SeedStreaming.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
