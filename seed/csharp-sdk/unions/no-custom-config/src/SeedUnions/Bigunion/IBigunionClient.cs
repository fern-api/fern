namespace SeedUnions;

public partial interface IBigunionClient
{
    Task<BigUnion> GetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<bool> UpdateAsync(
        BigUnion request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Dictionary<string, bool>> UpdateManyAsync(
        IEnumerable<BigUnion> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
