namespace SeedNurseryApi;

public partial interface IPackageClient
{
    Task TestAsync(
        TestRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
