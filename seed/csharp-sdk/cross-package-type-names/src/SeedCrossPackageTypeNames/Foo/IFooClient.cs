namespace SeedCrossPackageTypeNames;

public partial interface IFooClient
{
    Task<ImportingType> FindAsync(
        FindRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
