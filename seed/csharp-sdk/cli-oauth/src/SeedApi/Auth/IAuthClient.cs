namespace SeedApi;

public partial interface IAuthClient
{
    WithRawResponseTask<TokenResponse> GetTokenAsync(
        GetTokenAuthRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TokenResponse> RefreshTokenAsync(
        RefreshTokenAuthRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
