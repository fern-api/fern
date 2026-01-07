namespace SeedSingleUrlEnvironmentNoDefault;

public partial interface IDummyClient
{
    Task<string> GetDummyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
