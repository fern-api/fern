namespace SeedErrorProperty;

public partial interface IPropertyBasedErrorClient
{
    /// <summary>
    /// GET request that always throws an error
    /// </summary>
    Task<string> ThrowErrorAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
