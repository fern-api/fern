using System.Net.Http;

namespace SeedNurseryApi.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
