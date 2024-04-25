using SeedSingleUrlEnvironmentDefault;

namespace SeedSingleUrlEnvironmentDefault;

public class DummyClient
{
    private RawClient _client;

    public DummyClient(RawClient client)
    {
        _client = client;
    }

    public async void GetDummyAsync() { }
}
