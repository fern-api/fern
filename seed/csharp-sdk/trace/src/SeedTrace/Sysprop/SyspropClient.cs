using SeedTrace;

namespace SeedTrace;

public class SyspropClient
{
    private RawClient _client;

    public SyspropClient(RawClient client)
    {
        _client = client;
    }

    public async void SetNumWarmInstancesAsync() { }

    public async void GetNumWarmInstancesAsync() { }
}
