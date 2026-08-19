namespace SeedApi;

public partial interface IAuthClient
{
    WithRawResponseTask<AuthGetTokenResponse> GettokenAsync(
        AuthGetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
