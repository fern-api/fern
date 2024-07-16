using System.Net.Http;

namespace SeedSingleUrlEnvironmentDefault.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
