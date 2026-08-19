namespace SeedAccept;

public partial interface IServiceClient
{
    WithRawResponseTask EndpointAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
