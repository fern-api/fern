namespace SeedApi;

public partial interface IAuthClient
{
    WithRawResponseTask<TokenResponse> GettokenAsync(
        GetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
