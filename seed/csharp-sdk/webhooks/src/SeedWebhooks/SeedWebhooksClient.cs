using SeedWebhooks.Core;

namespace SeedWebhooks;

public partial class SeedWebhooksClient : ISeedWebhooksClient
{
    private readonly RawClient _client;

    public SeedWebhooksClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedWebhooks" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernwebhooks/0.0.1" },
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
    }
}
