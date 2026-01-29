using SeedPlainText.Core;

namespace SeedPlainText;

public partial class SeedPlainTextClient : ISeedPlainTextClient
{
    private readonly RawClient _client;

    public SeedPlainTextClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedPlainText" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernplain-text/0.0.1" },
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
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
