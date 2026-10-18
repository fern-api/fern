using SeedCsharpEndpointSecurityOptionalAuth.Core;

namespace SeedCsharpEndpointSecurityOptionalAuth;

public partial class SeedCsharpEndpointSecurityOptionalAuthClient
    : ISeedCsharpEndpointSecurityOptionalAuthClient
{
    private readonly RawClient _client;

    public SeedCsharpEndpointSecurityOptionalAuthClient(
        string? username = null,
        string? password = null,
        string? token = null,
        ClientOptions? clientOptions = null
    )
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpEndpointSecurityOptionalAuth" },
                {
                    "X-Fern-SDK-Version",
                    global::SeedCsharpEndpointSecurityOptionalAuth.Version.Current
                },
                { "User-Agent", "Ferncsharp-endpoint-security-optional-auth/0.0.1" },
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
        if (username != null && password != null)
        {
            clientOptionsWithAuth.AuthHeaderSchemes["Basic"] = new Headers(
                new Dictionary<string, string>()
                {
                    {
                        "Authorization",
                        $"Basic {Convert.ToBase64String(global::System.Text.Encoding.UTF8.GetBytes($"{username}:{password}"))}"
                    },
                }
            );
        }
        if (token != null)
        {
            clientOptionsWithAuth.AuthHeaderSchemes["Bearer"] = new Headers(
                new Dictionary<string, string>() { { "Authorization", $"Bearer {token}" } }
            );
        }
        _client = new RawClient(clientOptionsWithAuth);
        Auth = new AuthClient(_client);
        User = new UserClient(_client);
    }

    public IAuthClient Auth { get; }

    public IUserClient User { get; }
}
