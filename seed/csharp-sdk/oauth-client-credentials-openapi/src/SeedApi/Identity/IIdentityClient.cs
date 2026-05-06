namespace SeedApi;

public partial interface IIdentityClient
{
    WithRawResponseTask<TokenResponse> GettokenAsync(
        IdentityGetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
