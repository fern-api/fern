using System.Net.Http;

namespace SeedFileUpload.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
