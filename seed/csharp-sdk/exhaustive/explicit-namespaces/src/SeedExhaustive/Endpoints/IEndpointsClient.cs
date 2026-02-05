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
