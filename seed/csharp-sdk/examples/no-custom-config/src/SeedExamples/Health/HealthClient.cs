using SeedExamples.Core;

namespace SeedExamples.Health;

public partial class HealthClient : IHealthClient
{
    private RawClient _client;

    internal HealthClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public ServiceClient Service { get; }

    public HealthClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
