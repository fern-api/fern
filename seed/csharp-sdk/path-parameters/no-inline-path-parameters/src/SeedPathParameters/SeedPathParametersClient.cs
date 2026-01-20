using SeedPathParameters.Core;

namespace SeedPathParameters;

public partial class SeedPathParametersClient : ISeedPathParametersClient
{
    private readonly RawClient _client;

    public SeedPathParametersClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedPathParameters" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernpath-parameters/0.0.1" },
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
        Organizations = new OrganizationsClient(_client);
        User = new UserClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public OrganizationsClient Organizations { get; }

    public UserClient User { get; }

    public SeedPathParametersClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
