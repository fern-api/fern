using SeedExhaustive.Core;
using SeedExhaustive.Endpoints.Container;
using SeedExhaustive.Endpoints.ContentType;
using SeedExhaustive.Endpoints.Enum;
using SeedExhaustive.Endpoints.HttpMethods;
using SeedExhaustive.Endpoints.Object;
using SeedExhaustive.Endpoints.Params;
using SeedExhaustive.Endpoints.Primitive;
using SeedExhaustive.Endpoints.Put;
using SeedExhaustive.Endpoints.Union;
using SeedExhaustive.Endpoints.Urls;

namespace SeedExhaustive.Endpoints;

public partial class EndpointsClient
{
    private SeedExhaustive.Core.RawClient _client;

    internal EndpointsClient(SeedExhaustive.Core.RawClient client)
    {
        _client = client;
        Container = new SeedExhaustive.Endpoints.Container.ContainerClient(_client);
        ContentType = new SeedExhaustive.Endpoints.ContentType.ContentTypeClient(_client);
        Enum = new SeedExhaustive.Endpoints.Enum.EnumClient(_client);
        HttpMethods = new SeedExhaustive.Endpoints.HttpMethods.HttpMethodsClient(_client);
        Object = new SeedExhaustive.Endpoints.Object.ObjectClient(_client);
        Params = new SeedExhaustive.Endpoints.Params.ParamsClient(_client);
        Primitive = new SeedExhaustive.Endpoints.Primitive.PrimitiveClient(_client);
        Put = new SeedExhaustive.Endpoints.Put.PutClient(_client);
        Union = new SeedExhaustive.Endpoints.Union.UnionClient(_client);
        Urls = new SeedExhaustive.Endpoints.Urls.UrlsClient(_client);
    }

    public SeedExhaustive.Endpoints.Container.ContainerClient Container { get; }

    public SeedExhaustive.Endpoints.ContentType.ContentTypeClient ContentType { get; }

    public SeedExhaustive.Endpoints.Enum.EnumClient Enum { get; }

    public SeedExhaustive.Endpoints.HttpMethods.HttpMethodsClient HttpMethods { get; }

    public SeedExhaustive.Endpoints.Object.ObjectClient Object { get; }

    public SeedExhaustive.Endpoints.Params.ParamsClient Params { get; }

    public SeedExhaustive.Endpoints.Primitive.PrimitiveClient Primitive { get; }

    public SeedExhaustive.Endpoints.Put.PutClient Put { get; }

    public SeedExhaustive.Endpoints.Union.UnionClient Union { get; }

    public SeedExhaustive.Endpoints.Urls.UrlsClient Urls { get; }
}
