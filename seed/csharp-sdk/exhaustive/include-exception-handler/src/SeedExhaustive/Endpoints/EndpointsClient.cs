using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public partial class EndpointsClient
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
        Union = new UnionClient(_client);
    }

    public ContainerClient Container { get; }

    public ContentTypeClient ContentType { get; }

    public EnumClient Enum { get; }

    public HttpMethodsClient HttpMethods { get; }

    public ObjectClient Object { get; }

    public ParamsClient Params { get; }

    public PrimitiveClient Primitive { get; }

    public UnionClient Union { get; }
}
