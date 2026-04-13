namespace SeedApi;

public partial interface IPropertybasederrorClient
{
    /// <summary>
    /// GET request that always throws an error
    /// </summary>
    WithRawResponseTask<string> ThrowerrorAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
