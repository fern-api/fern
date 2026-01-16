using SeedExamples.Core;

namespace SeedExamples.Health;

public partial class HealthClient : IHealthClient
{
    private RawClient _client;

    internal HealthClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public ServiceClient Service { get; }

    public HealthClient.RawAccessClient Raw { get; }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }
    }
}
