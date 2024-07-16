using SeedExamples.Core;
using SeedExamples.Health;

#nullable enable

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
