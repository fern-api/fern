using System.Net.Http;

namespace SeedCrossPackageTypeNames.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
