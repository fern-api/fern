using SeedInferredAuthImplicitNoExpiry;

namespace SeedInferredAuthImplicitNoExpiry.Nested;

public partial interface IApiClient
{
    WithRawResponseTask GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
