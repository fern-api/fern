using SeedExhaustive.Core;

namespace SeedExhaustive;

public partial interface IReqWithHeadersClient
{
    WithRawResponseTask GetWithCustomHeaderAsync(
        ReqWithHeaders request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
