namespace SeedOauthClientCredentials;

public partial interface ISimpleClient
{
    Task GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
