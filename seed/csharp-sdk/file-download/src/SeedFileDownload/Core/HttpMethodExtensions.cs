using System.Net.Http;

namespace SeedFileDownload.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
