using System.Net.Http;

namespace SeedObjectsWithImports.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
