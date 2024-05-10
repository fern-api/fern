using SeedAlias;

namespace SeedAlias;

public partial class SeedAliasClient
{
    private RawClient _client;
    public SeedAliasClient (ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string>() {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
    }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
