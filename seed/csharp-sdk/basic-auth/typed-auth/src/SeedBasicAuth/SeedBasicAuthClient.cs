using SeedBasicAuth.Core;

namespace SeedBasicAuth;

public partial class SeedBasicAuthClient : ISeedBasicAuthClient
{
    private readonly RawClient _client;

    public SeedBasicAuthClient(Auth auth, ClientOptions? clientOptions = null)
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
        var clientOptionsWithAuth = clientOptions.Clone();
        if (auth.BuildAuthHeader() is { } authHeader)
        {
            clientOptionsWithAuth.Headers[authHeader.Name] = authHeader.Value;
        }
        _client = new RawClient(clientOptionsWithAuth);
        BasicAuth = new BasicAuthClient(_client);
    }

    public IBasicAuthClient BasicAuth { get; }
}
