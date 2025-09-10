using System.Net.Http;

namespace SeedBytesDownload.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
