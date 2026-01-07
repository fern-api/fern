namespace SeedExhaustive;

public partial interface IReqWithHeadersClient
{
    Task GetWithCustomHeaderAsync(
        ReqWithHeaders request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
