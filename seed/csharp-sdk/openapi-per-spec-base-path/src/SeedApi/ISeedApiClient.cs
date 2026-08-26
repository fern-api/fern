using SeedApi.Oauth;

namespace SeedApi;

public partial interface ISeedApiClient
{
    public IOauthClient Oauth { get; }
    WithRawResponseTask<IEnumerable<string>> ListItemsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
