namespace SeedUnions;

public partial interface IBigunionClient
{
    Task<object> GetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<bool> UpdateAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Dictionary<string, bool>> UpdateManyAsync(
        IEnumerable<object> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
