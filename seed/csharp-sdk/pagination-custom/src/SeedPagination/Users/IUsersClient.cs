using SeedPagination.Core;

namespace SeedPagination;

public partial interface IUsersClient
{
    Task<SeedPaginationPager<string>> ListUsernamesCustomAsync(
        ListUsernamesRequestCustom request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
