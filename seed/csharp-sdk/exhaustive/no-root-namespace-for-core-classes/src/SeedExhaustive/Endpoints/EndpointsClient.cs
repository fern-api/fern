using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public partial class EndpointsClient : IEndpointsClient
{
    private RawClient _client;

    internal EndpointsClient(RawClient client)
    {
        _client = client;
        Container = new ContainerClient(_client);
        ContentType = new ContentTypeClient(_client);
        Enum = new EnumClient(_client);
        HttpMethods = new HttpMethodsClient(_client);
        Object = new ObjectClient(_client);
        Params = new ParamsClient(_client);
        Primitive = new PrimitiveClient(_client);
        Put = new PutClient(_client);
        Union = new UnionClient(_client);
        Urls = new UrlsClient(_client);
    }

    public IContainerClient Container { get; }

    public IContentTypeClient ContentType { get; }

    public IEnumClient Enum { get; }

    public IHttpMethodsClient HttpMethods { get; }

    public IObjectClient Object { get; }

    public IParamsClient Params { get; }

    public IPrimitiveClient Primitive { get; }

    public IPutClient Put { get; }

    public IUnionClient Union { get; }

    public IUrlsClient Urls { get; }
}
