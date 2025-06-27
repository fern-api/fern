using System.Net.Http;

namespace SeedObjectsWithImports.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
