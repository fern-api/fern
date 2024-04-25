using SeedQueryParameters;

namespace SeedQueryParameters;

public class UserClient
{
    private RawClient _client;

    public UserClient(RawClient client)
    {
        _client = client;
    }

    public async void GetUsernameAsync() { }
}
