using SeedBasicAuthEnvironmentVariables.Core;

namespace SeedBasicAuthEnvironmentVariables;

public partial class SeedBasicAuthEnvironmentVariablesClient
    : ISeedBasicAuthEnvironmentVariablesClient
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
        Raw = new RawAccessClient(_client);
    }

    public BasicAuthClient BasicAuth { get; }

    public SeedBasicAuthEnvironmentVariablesClient.RawAccessClient Raw { get; }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
        }
    }
}
