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
        Raw = new RawAccessClient(_client);
    }

    public ContainerClient Container { get; }

    public ContentTypeClient ContentType { get; }

    public SeedExhaustive.Endpoints.Enum.EnumClient Enum { get; }

    public HttpMethodsClient HttpMethods { get; }

    public SeedExhaustive.Endpoints.Object.ObjectClient Object { get; }

    public ParamsClient Params { get; }

    public PrimitiveClient Primitive { get; }

    public PutClient Put { get; }

    public SeedExhaustive.Endpoints.Union.UnionClient Union { get; }

    public UrlsClient Urls { get; }

    public EndpointsClient.RawAccessClient Raw { get; }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }
    }
}
