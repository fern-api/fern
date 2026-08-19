namespace SeedNurseryApi;

public partial interface IPackageClient
{
    WithRawResponseTask TestAsync(
        TestRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
