using SeedExhaustive.Core;
using SeedExhaustive.Endpoints.Container;
using SeedExhaustive.Endpoints.ContentType;
using SeedExhaustive.Endpoints.HttpMethods;
using SeedExhaustive.Endpoints.Params;
using SeedExhaustive.Endpoints.Primitive;
using SeedExhaustive.Endpoints.Put;
using SeedExhaustive.Endpoints.Urls;

namespace SeedExhaustive.Endpoints;

public partial class EndpointsClient : IEndpointsClient
{
    private RawClient _client;

    internal EndpointsClient(RawClient client)
    {
        _client = client;
        Container = new ContainerClient(_client);
        ContentType = new ContentTypeClient(_client);
        Enum = new SeedExhaustive.Endpoints.Enum.EnumClient(_client);
        HttpMethods = new HttpMethodsClient(_client);
        Object = new SeedExhaustive.Endpoints.Object.ObjectClient(_client);
        Params = new ParamsClient(_client);
        Primitive = new PrimitiveClient(_client);
        Put = new PutClient(_client);
        Union = new SeedExhaustive.Endpoints.Union.UnionClient(_client);
        Urls = new UrlsClient(_client);
    }

    public IContainerClient Container { get; }

    public IContentTypeClient ContentType { get; }

    public SeedExhaustive.Endpoints.Enum.IEnumClient Enum { get; }

    public IHttpMethodsClient HttpMethods { get; }

    public SeedExhaustive.Endpoints.Object.IObjectClient Object { get; }

    public IParamsClient Params { get; }

    public IPrimitiveClient Primitive { get; }

    public IPutClient Put { get; }

    public SeedExhaustive.Endpoints.Union.IUnionClient Union { get; }

    public IUrlsClient Urls { get; }
}
