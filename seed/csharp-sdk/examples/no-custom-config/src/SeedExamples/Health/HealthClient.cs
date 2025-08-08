namespace SeedExamples.Health;

public partial class HealthClient
{
    private SeedExamples.Core.RawClient _client;

    internal HealthClient(SeedExamples.Core.RawClient client)
    {
        _client = client;
        Service = new SeedExamples.Health.ServiceClient(_client);
    }

    public SeedExamples.Health.ServiceClient Service { get; }
}
