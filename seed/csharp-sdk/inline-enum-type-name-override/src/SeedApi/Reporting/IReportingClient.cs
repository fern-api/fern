namespace SeedApi;

public partial interface IReportingClient
{
    WithRawResponseTask LoadAsync(
        LoadRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
