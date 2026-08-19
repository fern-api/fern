using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Endpoints.Pagination;

public partial interface IPaginationClient
{
    /// <summary>
    /// List items with cursor pagination
    /// </summary>
    Task<Pager<ObjectWithRequiredField>> ListItemsAsync(
        ListItemsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
