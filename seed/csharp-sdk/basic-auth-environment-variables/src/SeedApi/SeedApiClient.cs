using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(
        string? username = null,
        string? password = null,
        ClientOptions? clientOptions = null
    )
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernbasic-auth-environment-variables/0.0.1" },
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
        clientOptionsWithAuth.Headers["Authorization"] =
            $"Basic {Convert.ToBase64String(global::System.Text.Encoding.UTF8.GetBytes($"{username}:{password}"))}";
        _client = new RawClient(clientOptionsWithAuth);
        Basicauth = new BasicauthClient(_client);
    }

    public IBasicauthClient Basicauth { get; }
}
