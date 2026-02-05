using SeedApi;

namespace SeedApi.A.B;

public partial interface IBClient
{
    Task FooAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
