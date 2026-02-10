namespace SeedUnions;

public partial interface IBigunionClient
{
    WithRawResponseTask<object> GetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> UpdateAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Dictionary<string, bool>> UpdateManyAsync(
        IEnumerable<object> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
