using System.Net.Http;

namespace SeedExtraProperties.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
