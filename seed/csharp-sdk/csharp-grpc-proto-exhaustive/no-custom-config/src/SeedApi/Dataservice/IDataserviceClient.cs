namespace SeedApi;

public partial interface IDataserviceClient
{
    Task<Dictionary<string, object?>> FooAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
