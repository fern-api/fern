using SeedOauthClientCredentials;

namespace SeedOauthClientCredentials;

public class AuthClient
{
    private RawClient _client;

    public AuthClient(RawClient client)
    {
        _client = client;
    }

    public async void GetTokenWithClientCredentialsAsync() { }

    public async void RefreshTokenAsync() { }
}
