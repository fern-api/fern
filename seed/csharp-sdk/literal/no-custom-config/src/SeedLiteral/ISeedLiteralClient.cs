namespace SeedLiteral;

public partial interface ISeedLiteralClient
{
    public IHeadersClient Headers { get; }
    public IInlinedClient Inlined { get; }
    public IPathClient Path { get; }
    public IQueryClient Query { get; }
    public IReferenceClient Reference { get; }
}
