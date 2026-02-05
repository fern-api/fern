using SeedInferredAuthImplicitNoExpiry;

namespace SeedInferredAuthImplicitNoExpiry.NestedNoAuth;

public partial interface IApiClient
{
    Task GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
