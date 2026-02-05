namespace SeedCrossPackageTypeNames;

public partial interface IFooClient
{
    WithRawResponseTask<ImportingType> FindAsync(
        FindRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
