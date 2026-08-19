namespace SeedVariables;

public partial interface IServiceClient
{
    WithRawResponseTask PostAsync(
        string endpointParam,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
