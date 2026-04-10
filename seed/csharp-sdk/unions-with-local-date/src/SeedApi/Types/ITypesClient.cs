namespace SeedApi;

public partial interface ITypesClient
{
    WithRawResponseTask<UnionWithTime> GetAsync(
        TypesGetRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> UpdateAsync(
        UnionWithTime request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
