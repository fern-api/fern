using SeedCustomAuth.Core;

namespace SeedCustomAuth;

public partial class SeedCustomAuthClient
{
    private readonly RawClient _client;

    public SeedCustomAuthClient(
        string? customAuthScheme = null,
        ClientOptions? clientOptions = null
    )
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-API-KEY", customAuthScheme },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCustomAuth" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncustom-auth/0.0.1" },
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
        CustomAuth = new CustomAuthClient(_client);
    }

    public CustomAuthClient CustomAuth { get; }
}
