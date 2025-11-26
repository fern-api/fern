using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Health;

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

    /// <summary>
    /// This endpoint checks the health of a resource.
    /// </summary>
    /// <example><code>
    /// await client.Health.Service.CheckAsync("id-2sdx82h");
    /// </code></example>
    public async Task CheckAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await WithRawResponse.CheckAsync(id, options, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// This endpoint checks the health of the service.
    /// </summary>
    /// <example><code>
    /// await client.Health.Service.PingAsync();
    /// </code></example>
    public async Task<bool> PingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse.PingAsync(options, cancellationToken).ConfigureAwait(false)
        ).Body;
    }
}
