using System.Net.Http;

namespace SeedCustomAuth.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
