using SeedExhaustive;

namespace SeedExhaustive.ReqWithHeaders;

public partial interface IReqWithHeadersClient
{
    Task GetWithCustomHeaderAsync(
        ReqWithHeaders request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
