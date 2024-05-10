using SeedAudiences;

namespace SeedAudiences;

public partial class SeedAudiencesClient
{
    private RawClient _client;

    public SeedAudiencesClient (ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string>() {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
        Foo = 
        new FooClient{
            _client}
    }

    public FooClient Foo { get; }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
