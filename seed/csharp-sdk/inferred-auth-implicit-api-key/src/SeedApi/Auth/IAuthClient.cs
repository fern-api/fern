namespace SeedApi;

public partial interface IAuthClient
{
    WithRawResponseTask<TokenResponse> GettokenAsync(
        AuthGetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
