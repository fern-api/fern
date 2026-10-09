namespace SeedOauthClientCredentialsEnvironmentVariables;

public partial interface ISimpleClient
{
    WithRawResponseTask GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
