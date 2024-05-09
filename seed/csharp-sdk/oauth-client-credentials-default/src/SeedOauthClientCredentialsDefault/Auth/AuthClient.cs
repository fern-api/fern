using SeedOauthClientCredentialsDefault;

namespace SeedOauthClientCredentialsDefault;

public class AuthClient
{
    private RawClient _client;

    public AuthClient(RawClient client)
    {
        _client = client;
    }

    public async void GetTokenAsync() { }
}
