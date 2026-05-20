using SeedServerSentEventsResumable.Core;

namespace SeedServerSentEventsResumable;

public partial class SeedServerSentEventsResumableClient : ISeedServerSentEventsResumableClient
{
    private readonly RawClient _client;

    public SeedServerSentEventsResumableClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedServerSentEventsResumable" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernserver-sent-events-resumable/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Completions = new CompletionsClient(_client);
    }

    public ICompletionsClient Completions { get; }
}
