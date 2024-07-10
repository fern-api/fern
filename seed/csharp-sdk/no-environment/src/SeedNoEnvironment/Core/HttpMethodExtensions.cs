using System.Net.Http;

namespace SeedNoEnvironment.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
