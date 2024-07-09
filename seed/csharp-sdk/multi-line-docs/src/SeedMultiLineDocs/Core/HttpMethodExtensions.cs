using System.Net.Http;

namespace SeedMultiLineDocs.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
