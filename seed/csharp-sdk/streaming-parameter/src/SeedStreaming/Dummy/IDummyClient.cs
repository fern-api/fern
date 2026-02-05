namespace SeedStreaming;

public partial interface IDummyClient
{
    IAsyncEnumerable<StreamResponse> GenerateAsync(
        GenerateRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
