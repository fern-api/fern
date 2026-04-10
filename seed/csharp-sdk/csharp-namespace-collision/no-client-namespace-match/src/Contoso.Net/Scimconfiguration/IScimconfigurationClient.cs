using Contoso.Net;

namespace Contoso.Net.ScimConfiguration;

public partial interface IScimConfigurationClient
{
    WithRawResponseTask<ScimConfiguration> GetConfigurationAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ScimToken> CreateTokenAsync(
        ScimToken request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<Contoso.Net.User>> ListUsersAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
