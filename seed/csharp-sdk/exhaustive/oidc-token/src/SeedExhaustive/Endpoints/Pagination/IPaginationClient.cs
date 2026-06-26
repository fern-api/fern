using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

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
