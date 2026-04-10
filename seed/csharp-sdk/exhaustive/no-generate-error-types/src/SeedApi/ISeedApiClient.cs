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
