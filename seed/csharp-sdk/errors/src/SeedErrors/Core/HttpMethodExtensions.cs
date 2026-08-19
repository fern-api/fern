using global::System.Net.Http;

namespace SeedErrors.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
