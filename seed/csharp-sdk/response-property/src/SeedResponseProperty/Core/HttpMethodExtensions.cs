using System.Net.Http;

namespace SeedResponseProperty.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
