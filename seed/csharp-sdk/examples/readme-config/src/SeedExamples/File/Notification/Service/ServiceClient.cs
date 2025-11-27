using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.File_.Notification;

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
    /// await client.File.Notification.Service.GetExceptionAsync("notification-hsy129x");
    /// </code></example>
    public async Task<SeedExamples.Exception> GetExceptionAsync(
        string notificationId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse
                .GetExceptionAsync(notificationId, options, cancellationToken)
                .ConfigureAwait(false)
        ).Body;
    }
}
