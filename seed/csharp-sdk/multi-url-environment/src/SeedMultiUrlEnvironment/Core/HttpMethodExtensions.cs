using System.Net.Http;

namespace SeedMultiUrlEnvironment.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
