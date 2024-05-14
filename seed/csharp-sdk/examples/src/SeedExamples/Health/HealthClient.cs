using SeedExamples;
using SeedExamples.Health;

namespace SeedExamples.Health;

public class HealthClient
{
    private RawClient _client;

    public HealthClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
