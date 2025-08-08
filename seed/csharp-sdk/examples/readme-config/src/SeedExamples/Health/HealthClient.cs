using SeedExamples.Core;

namespace SeedExamples.Health;

public partial class HealthClient
{
    private RawClient _client;

    internal HealthClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
