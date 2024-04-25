using SeedExhaustive;

namespace SeedExhaustive;

public class ReqWithHeadersClient
{
    private RawClient _client;

    public ReqWithHeadersClient(RawClient client)
    {
        _client = client;
    }

    public async void GetWithCustomHeaderAsync() { }
}
