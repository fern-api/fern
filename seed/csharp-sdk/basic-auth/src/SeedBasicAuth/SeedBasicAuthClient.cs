using SeedBasicAuth.Core;

namespace SeedBasicAuth;

public partial class SeedBasicAuthClient : ISeedBasicAuthClient
{
    private readonly RawClient _client;

    public SeedBasicAuthClient(
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
                { "X-Fern-SDK-Name", "SeedBasicAuth" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernbasic-auth/0.0.1" },
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
        BasicAuth = new BasicAuthClient(_client);
    }

    public BasicAuthClient BasicAuth { get; }
}
