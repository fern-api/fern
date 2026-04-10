namespace SeedApi;

public partial interface IScimconfigurationClient
{
    WithRawResponseTask<ScimConfigurationScimConfiguration> GetconfigurationAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ScimConfigurationScimToken> CreatetokenAsync(
        ScimConfigurationScimToken request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<User>> ListusersAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
