using SeedMultiUrlEnvironment;

namespace SeedMultiUrlEnvironment;

public class Ec2Client
{
    private RawClient _client;

    public Ec2Client(RawClient client)
    {
        _client = client;
    }

    public async void BootInstanceAsync() { }
}
