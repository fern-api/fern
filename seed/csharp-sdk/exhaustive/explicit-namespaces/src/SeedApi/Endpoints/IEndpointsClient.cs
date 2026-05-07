using SeedApi.Endpoints.Container;
using SeedApi.Endpoints.ContentType;
using SeedApi.Endpoints.Enum;
using SeedApi.Endpoints.HttpMethods;
using SeedApi.Endpoints.Object;
using SeedApi.Endpoints.Pagination;
using SeedApi.Endpoints.Params;
using SeedApi.Endpoints.Primitive;
using SeedApi.Endpoints.Put;
using SeedApi.Endpoints.Union;
using SeedApi.Endpoints.Urls;

namespace SeedApi.Endpoints;

public partial interface IEndpointsClient
{
    public IContainerClient Container { get; }
    public IContentTypeClient ContentType { get; }
    public IEnumClient Enum { get; }
    public IHttpMethodsClient HttpMethods { get; }
    public IObjectClient Object { get; }
    public IPaginationClient Pagination { get; }
    public IParamsClient Params { get; }
    public IPrimitiveClient Primitive { get; }
    public IPutClient Put { get; }
    public IUnionClient Union { get; }
    public IUrlsClient Urls { get; }
}
