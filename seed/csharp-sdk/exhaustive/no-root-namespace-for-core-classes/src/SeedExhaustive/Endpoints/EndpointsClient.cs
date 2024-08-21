using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Endpoints;

public partial class EndpointsClient
{
    private RawClient _client;

    internal EndpointsClient (RawClient client) {
        _client = client;
        Container = 
        new ContainerClientnew ContainerClient(
            _client
        );
        Enum = 
        new EnumClientnew EnumClient(
            _client
        );
        HttpMethods = 
        new HttpMethodsClientnew HttpMethodsClient(
            _client
        );
        Object = 
        new ObjectClientnew ObjectClient(
            _client
        );
        Params = 
        new ParamsClientnew ParamsClient(
            _client
        );
        Primitive = 
        new PrimitiveClientnew PrimitiveClient(
            _client
        );
        Union = 
        new UnionClientnew UnionClient(
            _client
        );
    }

    public ContainerClient Container { get; }

    public EnumClient Enum { get; }

    public HttpMethodsClient HttpMethods { get; }

    public ObjectClient Object { get; }

    public ParamsClient Params { get; }

    public PrimitiveClient Primitive { get; }

    public UnionClient Union { get; }

}
