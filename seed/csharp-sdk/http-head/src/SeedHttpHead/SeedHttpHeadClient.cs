using SeedHttpHead.Core;

namespace SeedHttpHead;

public partial class SeedHttpHeadClient : ISeedHttpHeadClient
{
    private readonly RawClient _client;

    public SeedHttpHeadClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new SeedHttpHead.Core.Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedHttpHead" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernhttp-head/0.0.1" },
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

    public SeedHttpHeadClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
