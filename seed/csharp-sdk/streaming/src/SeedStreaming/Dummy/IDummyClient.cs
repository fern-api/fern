namespace SeedStreaming;

public partial interface IDummyClient
{
    Task<IAsyncEnumerable<StreamResponse>> GenerateStreamAsync(
        GenerateStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<StreamResponse> GenerateAsync(
        Generateequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
