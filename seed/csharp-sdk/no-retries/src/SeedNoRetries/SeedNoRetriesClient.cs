using SeedNoRetries.Core;

namespace SeedNoRetries;

public partial class SeedNoRetriesClient : ISeedNoRetriesClient
{
    private readonly RawClient _client;

    public SeedNoRetriesClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedNoRetries" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernno-retries/0.0.1" },
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
        Retries = new RetriesClient(_client);
    }

    public RetriesClient Retries { get; }
}
