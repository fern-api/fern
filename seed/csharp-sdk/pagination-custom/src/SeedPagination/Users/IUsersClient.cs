using SeedPagination.Core;

namespace SeedPagination;

public partial interface IUsersClient
{
    Task<SeedPaginationPager<string>> ListWithCustomPagerAsync(
        ListWithCustomPagerRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
