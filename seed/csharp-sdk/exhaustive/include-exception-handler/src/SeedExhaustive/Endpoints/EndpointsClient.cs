using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public partial class EndpointsClient
{
    private RawClient _client;

    private ExceptionHandler _exceptionHandler;

    internal EndpointsClient(RawClient client, ExceptionHandler exceptionHandler)
    {
        _client = client;
        _exceptionHandler = exceptionHandler;
        Container = new ContainerClient(_client, _exceptionHandler);
        ContentType = new ContentTypeClient(_client, _exceptionHandler);
        Enum = new EnumClient(_client, _exceptionHandler);
        HttpMethods = new HttpMethodsClient(_client, _exceptionHandler);
        Object = new ObjectClient(_client, _exceptionHandler);
        Params = new ParamsClient(_client, _exceptionHandler);
        Primitive = new PrimitiveClient(_client, _exceptionHandler);
        Union = new UnionClient(_client, _exceptionHandler);
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
