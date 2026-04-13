namespace SeedApi;

public partial interface IDummyClient
{
    Task GenerateAsync(
        DummyGenerateRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
