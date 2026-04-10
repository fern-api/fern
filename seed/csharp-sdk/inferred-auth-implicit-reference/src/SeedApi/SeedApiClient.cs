using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferninferred-auth-implicit-reference/0.0.1" },
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
        Auth = new AuthClient(_client);
        NestedNoAuthApi = new NestedNoAuthApiClient(_client);
        NestedApi = new NestedApiClient(_client);
        Simple = new SimpleClient(_client);
    }

    public IAuthClient Auth { get; }

    public INestedNoAuthApiClient NestedNoAuthApi { get; }

    public INestedApiClient NestedApi { get; }

    public ISimpleClient Simple { get; }
}
