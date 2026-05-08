using SeedApi.Endpoints;

namespace SeedApi;

public partial interface ISeedApiClient
{
    public IInlinedRequestsClient InlinedRequests { get; }
    public INoAuthClient NoAuth { get; }
    public INoReqBodyClient NoReqBody { get; }
    public IReqWithHeadersClient ReqWithHeaders { get; }
    public IEndpointsClient Endpoints { get; }
}
