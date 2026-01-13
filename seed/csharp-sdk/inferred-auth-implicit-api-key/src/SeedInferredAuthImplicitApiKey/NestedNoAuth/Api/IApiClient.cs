using SeedInferredAuthImplicitApiKey;

namespace SeedInferredAuthImplicitApiKey.NestedNoAuth;

public partial interface IApiClient
{
    Task GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
