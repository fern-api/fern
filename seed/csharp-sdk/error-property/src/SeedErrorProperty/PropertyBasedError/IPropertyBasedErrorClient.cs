namespace SeedErrorProperty;

public partial interface IPropertyBasedErrorClient
{
    /// <summary>
    /// GET request that always throws an error
    /// </summary>
    WithRawResponseTask<string> ThrowErrorAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
