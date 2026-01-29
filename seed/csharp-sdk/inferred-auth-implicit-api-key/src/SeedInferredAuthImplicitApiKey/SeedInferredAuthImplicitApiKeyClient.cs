using SeedInferredAuthImplicitApiKey.Core;
using SeedInferredAuthImplicitApiKey.Nested;
using SeedInferredAuthImplicitApiKey.NestedNoAuth;

namespace SeedInferredAuthImplicitApiKey;

public partial class SeedInferredAuthImplicitApiKeyClient : ISeedInferredAuthImplicitApiKeyClient
{
    private readonly RawClient _client;

    public SeedInferredAuthImplicitApiKeyClient(string apiKey, ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedInferredAuthImplicitApiKey" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferninferred-auth-implicit-api-key/0.0.1" },
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
        var inferredAuthProvider = new InferredAuthTokenProvider(
            apiKey,
            new AuthClient(new RawClient(clientOptions))
        );
        clientOptionsWithAuth.Headers["Authorization"] =
            new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                (await inferredAuthProvider.GetAuthHeadersAsync().ConfigureAwait(false))
                    .First()
                    .Value
            );
        _client = new RawClient(clientOptionsWithAuth);
        Auth = new AuthClient(_client);
        NestedNoAuth = new NestedNoAuthClient(_client);
        Nested = new NestedClient(_client);
        Simple = new SimpleClient(_client);
    }

    public AuthClient Auth { get; }

    public NestedNoAuthClient NestedNoAuth { get; }

    public NestedClient Nested { get; }

    public SimpleClient Simple { get; }
}
