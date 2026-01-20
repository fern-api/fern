using SeedInferredAuthImplicitNoExpiry.Core;
using SeedInferredAuthImplicitNoExpiry.Nested;
using SeedInferredAuthImplicitNoExpiry.NestedNoAuth;

namespace SeedInferredAuthImplicitNoExpiry;

public partial class SeedInferredAuthImplicitNoExpiryClient
    : ISeedInferredAuthImplicitNoExpiryClient
{
    private readonly RawClient _client;

    public SeedInferredAuthImplicitNoExpiryClient(
        string xApiKey,
        string clientId,
        string clientSecret,
        string? scope = null,
        ClientOptions? clientOptions = null
    )
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedInferredAuthImplicitNoExpiry" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferninferred-auth-implicit-no-expiry/0.0.1" },
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
        var inferredAuthProvider = new InferredAuthTokenProvider(
            xApiKey,
            clientId,
            clientSecret,
            scope,
            new AuthClient(new RawClient(clientOptions.Clone()))
        );
        clientOptions.Headers["Authorization"] =
            new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                (await inferredAuthProvider.GetAuthHeadersAsync().ConfigureAwait(false))
                    .First()
                    .Value
            );
        _client = new RawClient(clientOptions);
        Auth = new AuthClient(_client);
        NestedNoAuth = new NestedNoAuthClient(_client);
        Nested = new NestedClient(_client);
        Simple = new SimpleClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public AuthClient Auth { get; }

    public NestedNoAuthClient NestedNoAuth { get; }

    public NestedClient Nested { get; }

    public SimpleClient Simple { get; }

    public SeedInferredAuthImplicitNoExpiryClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
