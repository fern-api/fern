using SeedInferredAuthImplicitApiKey;

namespace SeedInferredAuthImplicitApiKey.Nested;

public partial interface IApiClient
{
    Task GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
