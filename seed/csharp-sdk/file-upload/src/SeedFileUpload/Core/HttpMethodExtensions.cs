using System.Net.Http;

namespace SeedFileUpload.Core;

public static class HttpMethodExtensions
{
    public static readonly HttpMethod Patch = new("PATCH");
}
