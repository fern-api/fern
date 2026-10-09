namespace SeedOauthClientCredentialsWithVariables;

public partial interface IServiceClient
{
    WithRawResponseTask PostAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
