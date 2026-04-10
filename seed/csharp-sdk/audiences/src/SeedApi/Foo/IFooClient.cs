namespace SeedApi;

public partial interface IFooClient
{
    WithRawResponseTask<ImportingType> FindAsync(
        FooFindRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
