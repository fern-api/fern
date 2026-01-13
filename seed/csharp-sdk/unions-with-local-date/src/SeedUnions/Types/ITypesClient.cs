namespace SeedUnions;

public partial interface ITypesClient
{
    Task<UnionWithTime> GetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<bool> UpdateAsync(
        UnionWithTime request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
