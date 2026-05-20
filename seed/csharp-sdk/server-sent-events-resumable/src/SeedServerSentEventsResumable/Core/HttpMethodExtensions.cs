using global::System.Net.Http;

namespace SeedServerSentEventsResumable.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
