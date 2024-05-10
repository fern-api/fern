using SeedUnknownAsAny;

namespace SeedUnknownAsAny;

public partial class SeedUnknownAsAnyClient
{
    private RawClient _client;

    public SeedUnknownAsAnyClient (ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string>() {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
        Unknown = 
        new UnknownClient{
            _client}
    }

    public UnknownClient Unknown { get; }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
