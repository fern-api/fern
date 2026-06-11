namespace SeedPackageYml;

public partial interface IServiceClient
{
    WithRawResponseTask NopAsync(
        string id,
        string nestedId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
