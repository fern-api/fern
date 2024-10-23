using System.Net.Http;

namespace SeedPlainText.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
