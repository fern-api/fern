using SeedApi;

namespace SeedApi.A.C;

public partial interface ICClient
{
    Task FooAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
