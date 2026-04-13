namespace SeedApi;

public partial interface IDummyClient
{
    WithRawResponseTask<global::System.IO.Stream> GenerateStreamAsync(
        DummyGenerateStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<StreamResponse> GenerateAsync(
        DummyGenerateRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
