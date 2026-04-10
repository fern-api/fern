namespace SeedApi;

public partial interface IEndpointsPaginationClient
{
    /// <summary>
    /// List items with cursor pagination
    /// </summary>
    WithRawResponseTask<EndpointsPaginatedResponse> EndpointsPaginationListItemsAsync(
        EndpointsPaginationListItemsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
