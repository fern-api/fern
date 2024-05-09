using SeedUnions;

namespace SeedUnions;

public partial class SeedUnionsClient
{
    private RawClient _client;

    public SeedUnionsClient (ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string> {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
        Union = 
        new UnionClient{
            _client}
    }

    public UnionClient Union { get; }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
