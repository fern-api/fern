using SeedLiteral;

namespace SeedLiteral;

public partial class SeedLiteralClient
{
    private RawClient _client;

    public SeedLiteralClient (List<string> version, List<bool> auditLogging, ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string>() {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
        Headers = 
        new HeadersClient{
            _client}
        Inlined = 
        new InlinedClient{
            _client}
        Path = 
        new PathClient{
            _client}
        Query = 
        new QueryClient{
            _client}
        Reference = 
        new ReferenceClient{
            _client}
    }

    public HeadersClient Headers { get; }

    public InlinedClient Inlined { get; }

    public PathClient Path { get; }

    public QueryClient Query { get; }

    public ReferenceClient Reference { get; }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
