using System.Net.Http;

namespace SeedQueryParameters.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
