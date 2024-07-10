using System.Net.Http;

namespace SeedServerSentEvents.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
