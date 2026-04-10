using SeedInferredAuthExplicit;

namespace SeedInferredAuthExplicit.Nested;

public partial interface IApiClient
{
    Task GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
