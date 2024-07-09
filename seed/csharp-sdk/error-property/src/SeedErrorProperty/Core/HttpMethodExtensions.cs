using System.Net.Http;

namespace SeedErrorProperty.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
