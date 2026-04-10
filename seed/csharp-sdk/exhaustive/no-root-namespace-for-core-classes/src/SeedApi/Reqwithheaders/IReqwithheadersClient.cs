using SeedApi.Core;

namespace SeedApi;

public partial interface IReqwithheadersClient
{
    Task GetwithcustomheaderAsync(
        ReqWithHeadersGetWithCustomHeaderRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
