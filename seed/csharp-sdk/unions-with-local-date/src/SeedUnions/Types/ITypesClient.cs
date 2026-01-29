namespace SeedUnions;

public partial interface ITypesClient
{
    WithRawResponseTask<UnionWithTime> GetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> UpdateAsync(
        UnionWithTime request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
