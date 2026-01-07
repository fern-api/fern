namespace SeedEnum;

public partial interface ISeedEnumClient
{
    public HeadersClient Headers { get; }
    public InlinedRequestClient InlinedRequest { get; }
    public MultipartFormClient MultipartForm { get; }
    public PathParamClient PathParam { get; }
    public QueryParamClient QueryParam { get; }
}
