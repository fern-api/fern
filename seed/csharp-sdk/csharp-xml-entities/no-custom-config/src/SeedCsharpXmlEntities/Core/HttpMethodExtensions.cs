using System.Net.Http;

namespace SeedCsharpXmlEntities.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
