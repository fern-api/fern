using System.Net.Http;

namespace SeedCsharpNamespaceConflict.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
