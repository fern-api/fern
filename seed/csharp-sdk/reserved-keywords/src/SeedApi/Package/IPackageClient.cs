namespace SeedApi;

public partial interface IPackageClient
{
    Task TestAsync(
        PackageTestRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
