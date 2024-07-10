using System.Net.Http;

namespace SeedPackageYml.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
