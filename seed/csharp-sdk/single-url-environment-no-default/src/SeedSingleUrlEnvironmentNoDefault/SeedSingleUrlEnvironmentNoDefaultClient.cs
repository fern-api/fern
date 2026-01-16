using SeedSingleUrlEnvironmentNoDefault.Core;

namespace SeedSingleUrlEnvironmentNoDefault;

public partial class SeedSingleUrlEnvironmentNoDefaultClient
    : ISeedSingleUrlEnvironmentNoDefaultClient
{
    private readonly RawClient _client;

    public SeedSingleUrlEnvironmentNoDefaultClient(
        string? token = null,
        ClientOptions? clientOptions = null
    )
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token ?? ""}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedSingleUrlEnvironmentNoDefault" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernsingle-url-environment-no-default/0.0.1" },
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
        Dummy = new DummyClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public DummyClient Dummy { get; }

    public SeedSingleUrlEnvironmentNoDefaultClient.RawAccessClient Raw { get; }

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
