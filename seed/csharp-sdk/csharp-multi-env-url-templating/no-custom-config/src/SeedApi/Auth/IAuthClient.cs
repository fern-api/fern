using SeedApi;

namespace SeedApi.Auth;

public partial interface IAuthClient
{
    WithRawResponseTask<GetTokenResponse> GetTokenAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
