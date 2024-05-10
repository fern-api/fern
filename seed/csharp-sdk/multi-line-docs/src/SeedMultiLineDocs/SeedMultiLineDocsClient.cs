using SeedMultiLineDocs;

namespace SeedMultiLineDocs;

public partial class SeedMultiLineDocsClient
{
    private RawClient _client;

    public SeedMultiLineDocsClient (ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string>() {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
        User = 
        new UserClient{
            _client}
    }

    public UserClient User { get; }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
