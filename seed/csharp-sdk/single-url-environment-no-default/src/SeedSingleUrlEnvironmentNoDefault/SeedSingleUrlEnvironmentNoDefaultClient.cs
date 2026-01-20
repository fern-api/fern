using SeedSingleUrlEnvironmentNoDefault.Core;

namespace SeedSingleUrlEnvironmentNoDefault;

public partial class SeedSingleUrlEnvironmentNoDefaultClient
    : ISeedSingleUrlEnvironmentNoDefaultClient
{
    private readonly RawClient _client;

    public SeedSingleUrlEnvironmentNoDefaultClient(
        string? token = null,
        ClientOptions? clientOptions = null
    )
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token ?? ""}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedSingleUrlEnvironmentNoDefault" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernsingle-url-environment-no-default/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Dummy = new DummyClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public DummyClient Dummy { get; }

    public SeedSingleUrlEnvironmentNoDefaultClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
