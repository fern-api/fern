using System.Net.Http;

namespace <%= namespace%>;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}