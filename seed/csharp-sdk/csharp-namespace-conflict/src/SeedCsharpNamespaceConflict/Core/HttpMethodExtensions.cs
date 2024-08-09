using System.Net.Http;

namespace SeedCsharpNamespaceConflict.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
