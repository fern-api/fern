namespace SeedApi;

public partial interface IAuthClient
{
    WithRawResponseTask<AuthTokenResponse> GettokenAsync(
        AuthGetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
