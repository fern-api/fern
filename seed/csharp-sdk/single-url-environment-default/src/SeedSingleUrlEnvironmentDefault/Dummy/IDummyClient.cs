namespace SeedSingleUrlEnvironmentDefault;

public partial interface IDummyClient
{
    WithRawResponseTask<string> GetDummyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
