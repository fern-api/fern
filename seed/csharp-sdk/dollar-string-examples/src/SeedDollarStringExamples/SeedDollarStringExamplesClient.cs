using SeedDollarStringExamples.Core;

namespace SeedDollarStringExamples;

public partial class SeedDollarStringExamplesClient : ISeedDollarStringExamplesClient
{
    private readonly RawClient _client;

    public SeedDollarStringExamplesClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedDollarStringExamples" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferndollar-string-examples/0.0.1" },
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
        Raw = new WithRawResponseClient(_client);
    }

    public SeedDollarStringExamplesClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
