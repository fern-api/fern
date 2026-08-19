using SeedApi;

namespace SeedApi.A.B;

public partial interface IBClient
{
    WithRawResponseTask FooAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
