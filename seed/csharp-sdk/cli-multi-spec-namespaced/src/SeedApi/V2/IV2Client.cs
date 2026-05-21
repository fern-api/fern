using SeedApi;

namespace SeedApi.V2;

public partial interface IV2Client
{
    WithRawResponseTask<IEnumerable<UserV2>> ListUsersAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
