using SeedRequestParameters.Core;

namespace SeedRequestParameters;

public partial class SeedRequestParametersClient
{
    private readonly RawClient _client;

    public SeedRequestParametersClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedRequestParameters" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernrequest-parameters/0.0.1" },
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
    }

    public UserClient User { get; }
}
