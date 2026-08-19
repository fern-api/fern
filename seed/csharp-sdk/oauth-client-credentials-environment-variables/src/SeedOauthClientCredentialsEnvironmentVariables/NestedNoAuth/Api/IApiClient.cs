using SeedOauthClientCredentialsEnvironmentVariables;

namespace SeedOauthClientCredentialsEnvironmentVariables.NestedNoAuth;

public partial interface IApiClient
{
    WithRawResponseTask GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
