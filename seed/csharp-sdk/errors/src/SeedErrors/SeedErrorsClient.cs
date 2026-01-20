using SeedErrors.Core;

namespace SeedErrors;

public partial class SeedErrorsClient : ISeedErrorsClient
{
    private readonly RawClient _client;

    public SeedErrorsClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedErrors" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernerrors/0.0.1" },
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
        Simple = new SimpleClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public SimpleClient Simple { get; }

    public SeedErrorsClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
