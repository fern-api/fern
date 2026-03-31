using SeedExamples.Core;

namespace SeedExamples.Health;

public partial class HealthClient : IHealthClient
{
    private readonly RawClient _client;

    internal HealthClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public IServiceClient Service { get; }
}
