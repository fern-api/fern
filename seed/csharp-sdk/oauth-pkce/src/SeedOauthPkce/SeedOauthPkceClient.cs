using SeedOauthPkce.Core;

namespace SeedOauthPkce;

public partial class SeedOauthPkceClient : ISeedOauthPkceClient
{
    private readonly RawClient _client;

    public SeedOauthPkceClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedOauthPkce" },
                { "X-Fern-SDK-Version", global::SeedOauthPkce.Version.Current },
                { "User-Agent", "Fernoauth-pkce/0.0.1" },
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
        Oauth = new OauthClient(_client);
    }

    public IOauthClient Oauth { get; }
}
