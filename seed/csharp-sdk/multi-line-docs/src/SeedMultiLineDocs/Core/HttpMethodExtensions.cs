using System.Net.Http;

namespace SeedMultiLineDocs.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
