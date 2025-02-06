using System.Net.Http;

namespace SeedStreaming.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
