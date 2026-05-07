using SeedApi.Endpoints;
using SeedApi.Inlinedrequests;
using SeedApi.Noauth;
using SeedApi.Noreqbody;
using SeedApi.Reqwithheaders;

namespace SeedApi;

public partial interface ISeedApiClient
{
    public IInlinedrequestsClient Inlinedrequests { get; }
    public INoauthClient Noauth { get; }
    public INoreqbodyClient Noreqbody { get; }
    public IReqwithheadersClient Reqwithheaders { get; }
    public IEndpointsClient Endpoints { get; }
}
