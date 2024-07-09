using SeedLiteral;
using SeedLiteral.Core;

#nullable enable

namespace SeedLiteral;

public partial class SeedLiteralClient
{
    private RawClient _client;

    public SeedLiteralClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>()
            {
                { "X-API-Version", "02-02-2024" },
                { "X-API-Enable-Audit-Logging", true.ToString() },
                { "X-Fern-Language", "C#" },
            },
            clientOptions ?? new ClientOptions()
        );
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
