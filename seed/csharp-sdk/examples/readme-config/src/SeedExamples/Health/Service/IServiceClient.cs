using SeedExamples;

namespace SeedExamples.Health;

public partial interface IServiceClient
{
    /// <summary>
    /// This endpoint checks the health of a resource.
    /// </summary>
    Task CheckAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// This endpoint checks the health of the service.
    /// </summary>
    Task<bool> PingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
