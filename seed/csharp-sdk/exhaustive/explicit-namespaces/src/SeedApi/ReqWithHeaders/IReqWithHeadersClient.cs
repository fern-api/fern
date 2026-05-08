using SeedApi;

namespace SeedApi.ReqWithHeaders;

public partial interface IReqWithHeadersClient
{
    Task GetWithCustomHeaderAsync(
        GetWithCustomHeaderReqWithHeadersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
