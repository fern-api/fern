using SeedInferredAuthImplicit.Core;
using SeedInferredAuthImplicit.Nested;
using SeedInferredAuthImplicit.NestedNoAuth;

namespace SeedInferredAuthImplicit;

public partial class SeedInferredAuthImplicitClient
{
    private readonly RawClient _client;

    public SeedInferredAuthImplicitClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedInferredAuthImplicit" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferninferred-auth-implicit/0.0.1" },
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
