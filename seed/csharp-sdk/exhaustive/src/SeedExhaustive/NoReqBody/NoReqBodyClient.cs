using SeedExhaustive;

namespace SeedExhaustive;

public class NoReqBodyClient
{
    private RawClient _client;

    public NoReqBodyClient(RawClient client)
    {
        _client = client;
    }

    public async void GetWithNoRequestBodyAsync() { }

    public async void PostWithNoRequestBodyAsync() { }
}
