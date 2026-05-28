using SeedApi;

namespace SeedApi.V1;

public partial interface IV1Client
{
    WithRawResponseTask<IEnumerable<UserV1>> ListUsersAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
