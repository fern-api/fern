using SeedBasicAuthEnvironmentVariables.Core;

namespace SeedBasicAuthEnvironmentVariables;

public partial class SeedBasicAuthEnvironmentVariablesClient
{
    private readonly RawClient _client;

    public SeedBasicAuthEnvironmentVariablesClient(
        string? username = null,
        string? accessToken = null,
        ClientOptions? clientOptions = null
    )
    {
        username ??= GetFromEnvironmentOrThrow(
            "USERNAME",
            "Please pass in username or set the environment variable USERNAME."
        );
        accessToken ??= GetFromEnvironmentOrThrow(
            "PASSWORD",
            "Please pass in accessToken or set the environment variable PASSWORD."
        );
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedBasicAuthEnvironmentVariables" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernbasic-auth-environment-variables/0.0.1" },
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
    }

    public BasicAuthClient BasicAuth { get; }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }
}
