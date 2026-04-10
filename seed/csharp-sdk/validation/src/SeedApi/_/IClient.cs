namespace SeedApi;

public partial interface IClient
{
    WithRawResponseTask<Type> CreateAsync(
        CreateRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Type> GetAsync(
        GetRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
