using SeedBasicAuthOptional.Core;

namespace SeedBasicAuthOptional;

public partial class SeedBasicAuthOptionalClient : ISeedBasicAuthOptionalClient
{
    private readonly RawClient _client;

    public SeedBasicAuthOptionalClient(
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
                { "X-Fern-SDK-Name", "SeedBasicAuthOptional" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernbasic-auth-optional/0.0.1" },
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
            $"Basic {Convert.ToBase64String(global::System.Text.Encoding.UTF8.GetBytes($"{username}:{password ?? ""}"))}";
        _client = new RawClient(clientOptionsWithAuth);
        BasicAuth = new BasicAuthClient(_client);
    }

    public IBasicAuthClient BasicAuth { get; }
}
