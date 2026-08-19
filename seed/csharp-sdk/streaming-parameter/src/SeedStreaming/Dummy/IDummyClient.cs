namespace SeedStreaming;

public partial interface IDummyClient
{
    WithRawResponseStream<StreamResponse> GenerateAsync(
        GenerateRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
