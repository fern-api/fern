namespace SeedApi;

public partial interface ISeedApiClient
{
    public IHeadersClient Headers { get; }
    public IInlinedrequestClient Inlinedrequest { get; }
    public IMultipartformClient Multipartform { get; }
    public IPathparamClient Pathparam { get; }
    public IQueryparamClient Queryparam { get; }
}
