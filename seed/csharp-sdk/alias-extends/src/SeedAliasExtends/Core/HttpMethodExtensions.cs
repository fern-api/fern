using System.Net.Http;

namespace SeedAliasExtends.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
