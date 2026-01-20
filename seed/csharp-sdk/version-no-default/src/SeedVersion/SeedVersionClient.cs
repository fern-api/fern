using SeedVersion.Core;

namespace SeedVersion;

public partial class SeedVersionClient : ISeedVersionClient
{
    private readonly RawClient _client;

    public SeedVersionClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedVersion" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernversion-no-default/0.0.1" },
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
        User = new UserClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public UserClient User { get; }

    public SeedVersionClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
