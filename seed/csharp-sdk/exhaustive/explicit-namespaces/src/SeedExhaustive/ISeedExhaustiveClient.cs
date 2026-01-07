using SeedExhaustive.Endpoints;
using SeedExhaustive.InlinedRequests;
using SeedExhaustive.NoAuth;
using SeedExhaustive.NoReqBody;
using SeedExhaustive.ReqWithHeaders;

namespace SeedExhaustive;

public partial interface ISeedExhaustiveClient
{
    public EndpointsClient Endpoints { get; }
    public InlinedRequestsClient InlinedRequests { get; }
    public NoAuthClient NoAuth { get; }
    public NoReqBodyClient NoReqBody { get; }
    public ReqWithHeadersClient ReqWithHeaders { get; }
}
