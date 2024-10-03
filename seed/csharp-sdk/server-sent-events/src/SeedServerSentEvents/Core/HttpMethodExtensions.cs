using System.Net.Http;

namespace SeedServerSentEvents.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
