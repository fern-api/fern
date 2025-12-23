using System.Net.Http;

namespace SeedDollarStringExamples.Core;

internal static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
