using SeedApi.Core;

namespace SeedApi;

public partial interface IReqWithHeadersClient
{
    Task GetWithCustomHeaderAsync(
        GetWithCustomHeaderReqWithHeadersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
