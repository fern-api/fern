using SeedInferredAuthImplicit;

namespace SeedInferredAuthImplicit.Nested;

public partial interface IApiClient
{
    WithRawResponseTask GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
