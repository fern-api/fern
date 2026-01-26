namespace SeedExhaustive.Endpoints;

public partial interface IEndpointsClient
{
    public ContainerClient Container { get; }
    public ContentTypeClient ContentType { get; }
    public EnumClient Enum { get; }
    public HttpMethodsClient HttpMethods { get; }
    public ObjectClient Object { get; }
    public ParamsClient Params { get; }
    public PrimitiveClient Primitive { get; }
    public PutClient Put { get; }
    public UnionClient Union { get; }
    public UrlsClient Urls { get; }
}
