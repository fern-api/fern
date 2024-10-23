using System.Net.Http;

namespace SeedPackageYml.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
