using global::System.Net.Http;

namespace SeedCsharpElidePathParameters.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
