using SeedApi.EndpointsContainer;
using SeedApi.EndpointsContentType;
using SeedApi.EndpointsEnum;
using SeedApi.EndpointsHttpMethods;
using SeedApi.EndpointsObject;
using SeedApi.EndpointsPagination;
using SeedApi.EndpointsParams;
using SeedApi.EndpointsPrimitive;
using SeedApi.EndpointsPut;
using SeedApi.EndpointsUnion;
using SeedApi.EndpointsUrLs;
using SeedApi.Inlinedrequests;
using SeedApi.Noauth;
using SeedApi.Noreqbody;
using SeedApi.Reqwithheaders;

namespace SeedApi;

public partial interface ISeedApiClient
{
    public IEndpointsContainerClient EndpointsContainer { get; }
    public IEndpointsContentTypeClient EndpointsContentType { get; }
    public IEndpointsEnumClient EndpointsEnum { get; }
    public IEndpointsHttpMethodsClient EndpointsHttpMethods { get; }
    public IEndpointsObjectClient EndpointsObject { get; }
    public IEndpointsPaginationClient EndpointsPagination { get; }
    public IEndpointsParamsClient EndpointsParams { get; }
    public IEndpointsPrimitiveClient EndpointsPrimitive { get; }
    public IEndpointsPutClient EndpointsPut { get; }
    public IEndpointsUnionClient EndpointsUnion { get; }
    public IEndpointsUrLsClient EndpointsUrLs { get; }
    public IInlinedrequestsClient Inlinedrequests { get; }
    public INoauthClient Noauth { get; }
    public INoreqbodyClient Noreqbody { get; }
    public IReqwithheadersClient Reqwithheaders { get; }
}
