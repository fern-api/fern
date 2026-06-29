using SeedOauthClientCredentials;

namespace SeedOauthClientCredentials.NestedNoAuth;

public partial interface IApiClient
{
    WithRawResponseTask GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
