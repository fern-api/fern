namespace SeedStreaming;

public partial interface IDummyClient
{
    WithRawResponseStream<StreamResponse> GenerateStreamAsync(
        GenerateStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<StreamResponse> GenerateAsync(
        Generateequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
