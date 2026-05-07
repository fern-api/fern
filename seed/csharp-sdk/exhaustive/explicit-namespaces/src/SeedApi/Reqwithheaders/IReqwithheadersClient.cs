using SeedApi;

namespace SeedApi.Reqwithheaders;

public partial interface IReqwithheadersClient
{
    Task GetwithcustomheaderAsync(
        GetwithcustomheaderReqwithheadersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
