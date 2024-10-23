using System.Net.Http;

namespace <%= namespace%>;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}