using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernliteral/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Headers = new HeadersClient(_client);
        Inlined = new InlinedClient(_client);
        Path = new PathClient(_client);
        Query = new QueryClient(_client);
        Reference = new ReferenceClient(_client);
    }

    public IHeadersClient Headers { get; }

    public IInlinedClient Inlined { get; }

    public IPathClient Path { get; }

    public IQueryClient Query { get; }

    public IReferenceClient Reference { get; }
}
