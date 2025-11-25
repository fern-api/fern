using System.Net.Http;

namespace SeedHeaderTokenEnvironmentVariable.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
