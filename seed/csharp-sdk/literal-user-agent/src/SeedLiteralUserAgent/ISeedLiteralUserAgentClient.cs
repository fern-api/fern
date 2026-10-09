namespace SeedLiteralUserAgent;

public partial interface ISeedLiteralUserAgentClient
{
    WithRawResponseTask<string> PingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
