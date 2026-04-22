namespace SeedUnions;

public partial interface IUnionClient
{
    WithRawResponseTask<Shape> GetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> UpdateAsync(
        Shape request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
