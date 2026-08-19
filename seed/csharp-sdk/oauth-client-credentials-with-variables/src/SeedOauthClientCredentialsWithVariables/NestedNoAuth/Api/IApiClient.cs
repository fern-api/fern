using SeedOauthClientCredentialsWithVariables;

namespace SeedOauthClientCredentialsWithVariables.NestedNoAuth;

public partial interface IApiClient
{
    WithRawResponseTask GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
