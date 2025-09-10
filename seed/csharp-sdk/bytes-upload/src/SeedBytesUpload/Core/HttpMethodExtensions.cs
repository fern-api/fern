using System.Net.Http;

namespace SeedBytesUpload.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
