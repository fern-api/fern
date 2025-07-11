using global::System.Net.Http;

namespace <%= namespace%>;

internal class CustomPagerContext
{
    public required Func<HttpRequestMessage, CancellationToken,
        Task<HttpResponseMessage>> SendRequest { get; set; }
    public required HttpRequestMessage InitialHttpRequest { get; set; }
    public required ClientOptions ClientOptions { get; set; }
    public required IRequestOptions RequestOptions { get; set; }
}