namespace SeedApi;

public partial interface ISystemClient
{
    WithRawResponseTask HealthAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
