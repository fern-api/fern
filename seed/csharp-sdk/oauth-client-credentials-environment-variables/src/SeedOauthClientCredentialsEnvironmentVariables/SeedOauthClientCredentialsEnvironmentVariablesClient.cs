using SeedOauthClientCredentialsEnvironmentVariables.Core;
using SeedOauthClientCredentialsEnvironmentVariables.Nested;
using SeedOauthClientCredentialsEnvironmentVariables.NestedNoAuth;

namespace SeedOauthClientCredentialsEnvironmentVariables;

public partial class SeedOauthClientCredentialsEnvironmentVariablesClient
{
    private readonly RawClient _client;

    public SeedOauthClientCredentialsEnvironmentVariablesClient(
        string? clientId = null,
        string? clientSecret = null,
        ClientOptions? clientOptions = null
    )
    {
        clientId ??= GetFromEnvironmentOrThrow(
            "CLIENT_ID",
            "Please pass in clientId or set the environment variable CLIENT_ID."
        );
        clientSecret ??= GetFromEnvironmentOrThrow(
            "CLIENT_SECRET",
            "Please pass in clientSecret or set the environment variable CLIENT_SECRET."
        );
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedOauthClientCredentialsEnvironmentVariables" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernoauth-client-credentials-environment-variables/0.0.1" },
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
        var tokenProvider = new OAuthTokenProvider(
            clientId,
            clientSecret,
            new AuthClient(new RawClient(clientOptions.Clone()))
        );
        clientOptions.Headers["Authorization"] = new Func<string>(() =>
            tokenProvider.GetAccessTokenAsync().Result
        );
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

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }
}
