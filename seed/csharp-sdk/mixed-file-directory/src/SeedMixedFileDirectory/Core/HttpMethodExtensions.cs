using System.Net.Http;

namespace SeedMixedFileDirectory.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
