using System.Net.Http;

namespace SeedPagination.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
