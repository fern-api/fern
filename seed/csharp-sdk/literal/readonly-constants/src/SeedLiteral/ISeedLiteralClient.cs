namespace SeedLiteral;

public partial interface ISeedLiteralClient
{
    public HeadersClient Headers { get; }
    public InlinedClient Inlined { get; }
    public PathClient Path { get; }
    public QueryClient Query { get; }
    public ReferenceClient Reference { get; }
}
