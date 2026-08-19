using SeedApi;

namespace SeedApi.A.C;

public partial interface ICClient
{
    WithRawResponseTask FooAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
