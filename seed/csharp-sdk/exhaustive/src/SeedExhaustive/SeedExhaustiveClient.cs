using SeedExhaustive;

namespace SeedExhaustive;

public partial class SeedExhaustiveClient
{
    public SeedExhaustiveClient (string token){
    }
    public InlinedRequestsClient InlinedRequests { get; }

    public NoAuthClient NoAuth { get; }

    public NoReqBodyClient NoReqBody { get; }

    public ReqWithHeadersClient ReqWithHeaders { get; }
}
