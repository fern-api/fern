using System.Net.Http;

namespace SeedAliasExtends.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
