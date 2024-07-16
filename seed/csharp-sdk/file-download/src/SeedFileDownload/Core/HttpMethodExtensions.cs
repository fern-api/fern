using System.Net.Http;

namespace SeedFileDownload.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
