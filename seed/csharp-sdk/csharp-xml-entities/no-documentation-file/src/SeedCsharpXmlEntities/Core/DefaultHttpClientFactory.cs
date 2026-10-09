using global::System.Net;
using global::System.Net.Http;

namespace SeedCsharpXmlEntities.Core;

/// <summary>
/// Creates the default <see cref="HttpClient"/> used by the SDK, with automatic
/// response decompression enabled so that gzip/deflate encoded response bodies
/// are decompressed based on the response's Content-Encoding header.
/// </summary>
internal static class DefaultHttpClientFactory
{
    internal static HttpClient Create()
    {
        var handler = new HttpClientHandler
        {
#if NET5_0_OR_GREATER
            AutomaticDecompression = DecompressionMethods.All,
#else
            AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,
#endif
        };
        return new HttpClient(handler);
    }
}
