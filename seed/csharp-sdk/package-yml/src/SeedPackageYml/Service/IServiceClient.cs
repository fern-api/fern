namespace SeedPackageYml;

public partial interface IServiceClient
{
    Task NopAsync(
        string id,
        string nestedId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
