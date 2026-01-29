using SeedQueryParameters.Core;

namespace SeedQueryParameters;

public partial class SeedQueryParametersClient : ISeedQueryParametersClient
{
    private readonly RawClient _client;

    public SeedQueryParametersClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedQueryParameters" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernquery-parameters/0.0.1" },
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
        User = new UserClient(_client);
    }

    public UserClient User { get; }
}
