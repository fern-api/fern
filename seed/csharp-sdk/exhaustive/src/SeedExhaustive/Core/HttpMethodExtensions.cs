using System.Net.Http;

namespace SeedExhaustive.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
