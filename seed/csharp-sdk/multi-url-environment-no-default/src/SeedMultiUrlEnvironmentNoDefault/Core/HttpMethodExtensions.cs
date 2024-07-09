using System.Net.Http;

namespace SeedMultiUrlEnvironmentNoDefault.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
