namespace SeedApi;

public partial interface ISimpleClient
{
    WithRawResponseTask<FooResponse> FoowithoutendpointerrorAsync(
        FooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<FooResponse> FooAsync(
        FooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<FooResponse> FoowithexamplesAsync(
        FooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
