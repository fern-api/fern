using SeedOauthClientCredentialsWithVariables;

namespace SeedOauthClientCredentialsWithVariables.NestedNoAuth;

public partial interface IApiClient
{
    Task GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
