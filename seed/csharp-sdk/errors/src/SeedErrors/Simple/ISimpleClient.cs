namespace SeedErrors;

public partial interface ISimpleClient
{
    WithRawResponseTask<FooResponse> FooWithoutEndpointErrorAsync(
        FooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<FooResponse> FooAsync(
        FooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<FooResponse> FooWithExamplesAsync(
        FooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
