namespace SeedUnions;

public partial interface IBigunionClient
{
    WithRawResponseTask<BigUnion> GetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> UpdateAsync(
        BigUnion request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Dictionary<string, bool>> UpdateManyAsync(
        IEnumerable<BigUnion> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
