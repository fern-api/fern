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

public partial interface IEndpointsClient
{
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
