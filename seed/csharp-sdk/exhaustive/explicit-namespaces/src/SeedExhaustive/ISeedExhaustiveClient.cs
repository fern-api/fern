using SeedExhaustive.Endpoints;
using SeedExhaustive.InlinedRequests;
using SeedExhaustive.NoAuth;
using SeedExhaustive.NoReqBody;
using SeedExhaustive.ReqWithHeaders;

namespace SeedExhaustive;

public partial interface ISeedExhaustiveClient
{
    public IEndpointsClient Endpoints { get; }
    public IInlinedRequestsClient InlinedRequests { get; }
    public INoAuthClient NoAuth { get; }
    public INoReqBodyClient NoReqBody { get; }
    public IReqWithHeadersClient ReqWithHeaders { get; }
}
