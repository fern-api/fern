using SeedBearerTokenEnvironmentVariable.Core;

namespace SeedBearerTokenEnvironmentVariable;

public partial class SeedBearerTokenEnvironmentVariableClient
    : ISeedBearerTokenEnvironmentVariableClient
{
    private readonly RawClient _client;

    public SeedBearerTokenEnvironmentVariableClient(
        string? apiKey = null,
        ClientOptions? clientOptions = null
    )
    {
        apiKey ??= GetFromEnvironmentOrThrow(
            "COURIER_API_KEY",
            "Please pass in apiKey or set the environment variable COURIER_API_KEY."
        );
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {apiKey ?? ""}" },
                { "X-API-Version", "1.0.0" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedBearerTokenEnvironmentVariable" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernbearer-token-environment-variable/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        if (clientOptions.Version != null)
        {
            defaultHeaders["X-API-Version"] = clientOptions.Version;
        }
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Service = new ServiceClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public ServiceClient Service { get; }

    public SeedBearerTokenEnvironmentVariableClient.WithRawResponseClient Raw { get; }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
