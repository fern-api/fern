namespace SeedEnum;

public partial interface ISeedEnumClient
{
    public IHeadersClient Headers { get; }
    public IInlinedRequestClient InlinedRequest { get; }
    public IMultipartFormClient MultipartForm { get; }
    public IPathParamClient PathParam { get; }
    public IQueryParamClient QueryParam { get; }
}
