using System.Net.Http;

namespace SeedExhaustive.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
