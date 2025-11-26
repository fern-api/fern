using SeedStreaming.Core;

namespace SeedStreaming;

public partial class DummyClient
{
    private RawClient _client;

    private RawDummyClient _rawClient;

    internal DummyClient(RawClient client)
    {
        _client = client;
        _rawClient = new RawDummyClient(_client);
        WithRawResponse = _rawClient;
    }

    /// <summary>
    /// Access endpoints with raw HTTP response data (status code, headers).
    /// </summary>
    public RawDummyClient WithRawResponse { get; }

    /// <example><code>
    /// await client.Dummy.GenerateAsync(new Generateequest { Stream = false, NumEvents = 5 });
    /// </code></example>
    public async Task<StreamResponse> GenerateAsync(
        Generateequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse
                .GenerateAsync(request, options, cancellationToken)
                .ConfigureAwait(false)
        ).Body;
    }
}
