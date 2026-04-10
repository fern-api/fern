using SeedApi;

namespace SeedApi.Reqwithheaders;

public partial interface IReqwithheadersClient
{
    Task GetwithcustomheaderAsync(
        ReqWithHeadersGetWithCustomHeaderRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
