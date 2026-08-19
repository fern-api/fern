namespace SeedExhaustive.Endpoints;

public partial interface IEndpointsClient
{
    public IContainerClient Container { get; }
    public IContentTypeClient ContentType { get; }
    public IEnumClient Enum { get; }
    public IHttpMethodsClient HttpMethods { get; }
    public IObjectClient Object { get; }
    public IPaginationClient Pagination { get; }
    public IParamsClient Params { get; }
    public IPrimitiveClient Primitive { get; }
    public IPutClient Put { get; }
    public IUnionClient Union { get; }
    public IUrlsClient Urls { get; }
}
