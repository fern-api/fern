using SeedBytesDownload.Core;

namespace SeedBytesDownload;

public partial class ServiceClient
{
    private RawClient _client;

    private RawServiceClient _rawClient;

    internal ServiceClient(RawClient client)
    {
        _client = client;
        _rawClient = new RawServiceClient(_client);
        WithRawResponse = _rawClient;
    }

    /// <summary>
    /// Access endpoints with raw HTTP response data (status code, headers).
    /// </summary>
    public RawServiceClient WithRawResponse { get; }

    /// <example><code>
    /// await client.Service.SimpleAsync();
    /// </code></example>
    public async Task SimpleAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await WithRawResponse.SimpleAsync(options, cancellationToken).ConfigureAwait(false);
    }

    public async Task DownloadAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse
                .DownloadAsync(id, options, cancellationToken)
                .ConfigureAwait(false)
        ).Body;
    }
}
