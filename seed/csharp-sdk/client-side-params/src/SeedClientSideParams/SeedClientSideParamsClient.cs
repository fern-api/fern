using SeedClientSideParams.Core;

namespace SeedClientSideParams;

public partial class SeedClientSideParamsClient : ISeedClientSideParamsClient
{
    private readonly RawClient _client;

    public SeedClientSideParamsClient(string token, ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedClientSideParams" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernclient-side-params/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        var clientOptionsWithAuth = clientOptions.Clone();
        var authHeaders = new Headers(
            new Dictionary<string, string>() { { "Authorization", $"Bearer {token}" } }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
        }
        _client = new RawClient(clientOptionsWithAuth);
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
