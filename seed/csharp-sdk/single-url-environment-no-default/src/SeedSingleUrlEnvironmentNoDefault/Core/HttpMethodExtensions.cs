using System.Net.Http;

namespace SeedSingleUrlEnvironmentNoDefault.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
