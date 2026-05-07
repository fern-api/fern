using SeedApi.Endpoints;

namespace SeedApi;

public partial interface ISeedApiClient
{
    public IInlinedrequestsClient Inlinedrequests { get; }
    public INoauthClient Noauth { get; }
    public INoreqbodyClient Noreqbody { get; }
    public IReqwithheadersClient Reqwithheaders { get; }
    public IEndpointsClient Endpoints { get; }
}
