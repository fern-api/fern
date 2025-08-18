using System.Net.Http;

namespace SeedCsharpAccess.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
