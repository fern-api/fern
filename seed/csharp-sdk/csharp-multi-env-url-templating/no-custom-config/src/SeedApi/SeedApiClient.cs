using SeedApi.Auth;
using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        if (clientOptions.Region != null)
        {
            var _region = clientOptions.Region ?? "us1";
            if (!clientOptions.IsEnvironmentExplicitlySet)
            {
                clientOptions.Environment = new SeedApiEnvironment
                {
                    Acme = $"https://api.{_region}.acme.com",
                    Oauth = $"https://oauth.{_region}.acme.com",
                };
            }
            else if (clientOptions.Environment == SeedApiEnvironment.Production)
            {
                clientOptions.Environment = new SeedApiEnvironment
                {
                    Acme = $"https://api.{_region}.acme.com",
                    Oauth = $"https://oauth.{_region}.acme.com",
                };
            }
            else if (clientOptions.Environment == SeedApiEnvironment.Staging)
            {
                clientOptions.Environment = new SeedApiEnvironment
                {
                    Acme = $"https://api.stage.{_region}.acme.com",
                    Oauth = $"https://oauth.stage.{_region}.acme.com",
                };
            }
            else if (clientOptions.Environment == SeedApiEnvironment.Development)
            {
                clientOptions.Environment = new SeedApiEnvironment
                {
                    Acme = $"https://api.dev.{_region}.acme.com",
                    Oauth = $"https://oauth.dev.{_region}.acme.com",
                };
            }
        }
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", global::SeedApi.Version.Current },
                { "User-Agent", "Ferncsharp-multi-env-url-templating/0.0.1" },
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
        Core = new CoreClient(_client);
    }

    public IAuthClient Auth { get; }

    public ICoreClient Core { get; }
}
