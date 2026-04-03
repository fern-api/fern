using SeedBasicAuthPwOmitted.Core;

namespace SeedBasicAuthPwOmitted;

public partial class SeedBasicAuthPwOmittedClient : ISeedBasicAuthPwOmittedClient
{
    private readonly RawClient _client;

    public SeedBasicAuthPwOmittedClient(
        string? username = null,
        string? password = null,
        ClientOptions? clientOptions = null
    )
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedBasicAuthPwOmitted" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernbasic-auth-pw-omitted/0.0.1" },
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
        clientOptionsWithAuth.Headers["Authorization"] =
            $"Basic {Convert.ToBase64String(global::System.Text.Encoding.UTF8.GetBytes($"{username}:{password}"))}";
        _client = new RawClient(clientOptionsWithAuth);
        BasicAuth = new BasicAuthClient(_client);
    }

    public IBasicAuthClient BasicAuth { get; }
}
