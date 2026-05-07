using SeedApi;

namespace SeedApi.Endpoints.Pagination;

public partial interface IPaginationClient
{
    /// <summary>
    /// List items with cursor pagination
    /// </summary>
    WithRawResponseTask<EndpointsPaginatedResponse> ListItemsAsync(
        ListItemsPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
