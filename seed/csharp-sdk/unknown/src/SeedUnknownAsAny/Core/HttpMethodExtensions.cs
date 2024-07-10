using System.Net.Http;

namespace SeedUnknownAsAny.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
