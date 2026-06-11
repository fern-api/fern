using SeedExhaustive;

namespace SeedExhaustive.ReqWithHeaders;

public partial interface IReqWithHeadersClient
{
    WithRawResponseTask GetWithCustomHeaderAsync(
        ReqWithHeaders request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
