using SeedExhaustive.Endpoints.Container;
using SeedExhaustive.Endpoints.ContentType;
using SeedExhaustive.Endpoints.HttpMethods;
using SeedExhaustive.Endpoints.Params;
using SeedExhaustive.Endpoints.Primitive;
using SeedExhaustive.Endpoints.Put;
using SeedExhaustive.Endpoints.Urls;

namespace SeedExhaustive.Endpoints;

public partial interface IEndpointsClient
{
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
}
