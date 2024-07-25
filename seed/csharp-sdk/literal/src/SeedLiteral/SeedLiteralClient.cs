using System;
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
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Headers = new HeadersClient(_client);
        Inlined = new InlinedClient(_client);
        Path = new PathClient(_client);
        Query = new QueryClient(_client);
        Reference = new ReferenceClient(_client);
    }

    public HeadersClient Headers { get; init; }

    public InlinedClient Inlined { get; init; }

    public PathClient Path { get; init; }

    public QueryClient Query { get; init; }

    public ReferenceClient Reference { get; init; }
}
