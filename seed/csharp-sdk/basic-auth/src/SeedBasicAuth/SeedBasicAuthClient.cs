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
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedBasicAuth" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernbasic-auth/0.0.1" },
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
        BasicAuth = new BasicAuthClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public BasicAuthClient BasicAuth { get; }

    public SeedBasicAuthClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
