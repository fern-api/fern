namespace SeedApi;

public partial interface IHealthServiceClient
{
    /// <summary>
    /// This endpoint checks the health of a resource.
    /// </summary>
    Task HealthServiceCheckAsync(
        HealthServiceCheckRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// This endpoint checks the health of the service.
    /// </summary>
    WithRawResponseTask<bool> HealthServicePingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
