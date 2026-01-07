namespace SeedOauthClientCredentialsWithVariables;

public partial interface IServiceClient
{
    Task PostAsync(
        string endpointParam,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
