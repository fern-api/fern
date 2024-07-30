using SeedExhaustive.Core;
using SeedExhaustive.Endpoints.Container;
using SeedExhaustive.Endpoints.Enum;
using SeedExhaustive.Endpoints.HttpMethods;
using SeedExhaustive.Endpoints.Object;
using SeedExhaustive.Endpoints.Params;
using SeedExhaustive.Endpoints.Primitive;
using SeedExhaustive.Endpoints.Union;

#nullable enable

namespace SeedExhaustive.Endpoints;

public class EndpointsClient
{
    private RawClient _client;

    public EndpointsClient(RawClient client)
    {
        _client = client;
        Container = new ContainerClient(_client);
        Enum = new EnumClient(_client);
        HttpMethods = new HttpMethodsClient(_client);
        Object = new ObjectClient(_client);
        Params = new ParamsClient(_client);
        Primitive = new PrimitiveClient(_client);
        Union = new UnionClient(_client);
    }

    public ContainerClient Container { get; }

    public EnumClient Enum { get; }

    public HttpMethodsClient HttpMethods { get; }

    public ObjectClient Object { get; }

    public ParamsClient Params { get; }

    public PrimitiveClient Primitive { get; }

    public UnionClient Union { get; }
}
