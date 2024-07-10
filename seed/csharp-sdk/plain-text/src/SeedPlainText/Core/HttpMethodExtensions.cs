using System.Net.Http;

namespace SeedPlainText.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
