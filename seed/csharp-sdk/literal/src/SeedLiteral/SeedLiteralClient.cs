using SeedLiteral.Core;

namespace SeedLiteral;

public partial class SeedLiteralClient
{
    private readonly RawClient _client;

    public SeedLiteralClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-API-Version", "02-02-2024" },
                { "X-API-Enable-Audit-Logging", "true" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedLiteral" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernliteral/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        if (clientOptions.Version != null)
        {
            defaultHeaders["X-API-Version"] = clientOptions.Version;
        }
        if (clientOptions.AuditLogging != null)
        {
            defaultHeaders["X-API-Enable-Audit-Logging"] = clientOptions.AuditLogging.ToString()!;
        }
        foreach (var header in defaultHeaders)
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

    public HeadersClient Headers { get; }

    public InlinedClient Inlined { get; }

    public PathClient Path { get; }

    public QueryClient Query { get; }

    public ReferenceClient Reference { get; }
}
