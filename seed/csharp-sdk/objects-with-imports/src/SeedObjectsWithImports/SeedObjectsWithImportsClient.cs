using SeedObjectsWithImports;

namespace SeedObjectsWithImports;

public partial class SeedObjectsWithImportsClient
{
    private RawClient _client;
    public SeedObjectsWithImportsClient (ClientOptions clientOptions) {
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
