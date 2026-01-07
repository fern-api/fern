namespace SeedUnions;

public partial interface IUnionClient
{
    Task<Shape> GetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<bool> UpdateAsync(
        Shape request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
