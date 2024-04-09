using SeedLiteral;

namespace SeedLiteral;

public partial class SeedLiteralClient
{
    public SeedLiteralClient (List<string> version, List<bool> auditLogging){
    }
    public HeadersClient Headers { get; }

    public InlinedClient Inlined { get; }

    public PathClient Path { get; }

    public QueryClient Query { get; }

    public ReferenceClient Reference { get; }
}
