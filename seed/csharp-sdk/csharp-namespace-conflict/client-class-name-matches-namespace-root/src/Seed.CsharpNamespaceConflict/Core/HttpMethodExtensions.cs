using global::System.Net.Http;

namespace Seed.CsharpNamespaceConflict.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
