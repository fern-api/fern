using SeedUnknownAsAny;

namespace SeedUnknownAsAny;

public class UnknownClient
{
    private RawClient _client;

    public UnknownClient(RawClient client)
    {
        _client = client;
    }

    public async void PostAsync() { }
}
