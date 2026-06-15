using SeedInferredAuthImplicitNoExpiry;

namespace SeedInferredAuthImplicitNoExpiry.NestedNoAuth;

public partial interface IApiClient
{
    WithRawResponseTask GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
