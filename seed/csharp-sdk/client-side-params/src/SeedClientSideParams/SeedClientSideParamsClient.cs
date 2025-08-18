using SeedClientSideParams.Core;

namespace SeedClientSideParams;

public partial class SeedClientSideParamsClient
{
    private readonly RawClient _client;

    public SeedClientSideParamsClient(string token, ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedClientSideParams" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernclient-side-params/0.0.1" },
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
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
