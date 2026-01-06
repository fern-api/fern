namespace SeedErrors;

public partial interface ISimpleClient
{
    Task<FooResponse> FooWithoutEndpointErrorAsync(
        FooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<FooResponse> FooAsync(
        FooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<FooResponse> FooWithExamplesAsync(
        FooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
