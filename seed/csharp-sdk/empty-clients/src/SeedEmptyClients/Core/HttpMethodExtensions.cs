using System.Net.Http;

namespace SeedEmptyClients.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
