using System.Net.Http;

namespace SeedCsharpSystemCollision.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
